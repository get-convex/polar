typescript
import express from 'express';
import { Webhook, WebhookEvent } from 'svix';
import bodyParser from 'body-parser';
import { findOrCreateUserSubscription, updateUserSubscription } from '../services/usageBilling'; // Import conceptual DB functions, assume they are async

// Define a simple interface for the UserSubscription for better type safety
interface UserSubscription {
  userId: string;
  status: 'active' | 'inactive' | 'cancelled';
  tier: string; // e.g., 'basic', 'pro_tier_id'. Should map directly to Polar.sh product IDs.
  currentCredits: number;
  // Thêm các trường liên quan khác như 'lastUpdated', 'expiresAt', v.v.
}

// Define a simple interface for Polar.sh event payloads
interface PolarEventPayload {
  subscriber_id?: string;
  user?: { id: string };
  status?: string; // 'active', 'inactive', 'canceled'
  product_id?: string; // ID sản phẩm Polar.sh
  new_product_id?: string; // Dùng cho 'subscription.tier_changed'
  old_product_id?: string; // Dùng cho 'subscription.tier_changed'
  // ... các trường payload khác có thể có
}

// Define a simple interface for the overall Polar.sh webhook event
interface PolarWebhookEvent {
  type: string; // e.g., 'subscription.created', 'subscription.updated', 'subscription.cancelled', 'subscription.tier_changed'
  payload: PolarEventPayload;
  // ... các metadata Svix-specific khác có thể có ở cấp cao nhất của event.data
}

// Đảm bảo SVIX_WEBHOOK_SECRET được thiết lập trong môi trường của bạn
// Trong môi trường production, việc kiểm tra biến môi trường quan trọng này nên được thực hiện
// khi ứng dụng khởi động để thất bại nhanh chóng nếu thiếu.
const SVIX_WEBHOOK_SECRET = process.env.SVIX_WEBHOOK_SECRET;

const router = express.Router();

// Middleware để lấy raw body, điều cần thiết cho việc xác minh chữ ký Svix.
// Nó chỉ nên được áp dụng cho tuyến webhook này.
router.post('/', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
  if (!SVIX_WEBHOOK_SECRET) {
    // Ghi log nội bộ nhưng trả về lỗi chung để tránh tiết lộ chi tiết cấu hình.
    console.error('SERVER_ERROR: Webhook secret không được cấu hình. Không thể xác minh webhooks.');
    return res.status(500).json({ error: 'Lỗi cấu hình máy chủ.' });
  }

  const payload = req.body;
  const headers = req.headers;

  // QUAN TRỌNG: Tuân thủ hướng dẫn dự án (Quy tắc 3) để sử dụng 'webhook-signature'
  // cho các webhook tiêu chuẩn Svix, mặc dù thư viện Svix thường mặc định là 'svix-signature'.
  // Điều này ngụ ý rằng các webhook đến được cấu hình để sử dụng các tên chung này.
  const webhook_id = headers['webhook-id'] as string;
  const webhook_timestamp = headers['webhook-timestamp'] as string;
  const webhook_signature = headers['webhook-signature'] as string;

  if (!webhook_id || !webhook_timestamp || !webhook_signature) {
    console.error('WEBHOOK_ERROR: Thiếu các header webhook tiêu chuẩn (webhook-id, webhook-timestamp, webhook-signature).');
    return res.status(400).json({ error: 'Thiếu các header webhook bắt buộc.' });
  }

  const wh = new Webhook(SVIX_WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    // Xác minh Svix yêu cầu raw body dưới dạng chuỗi và các header cụ thể.
    // Các header được truyền ở đây phải khớp với các header thực tế được gửi bởi nhà cung cấp webhook.
    // Chúng ta sử dụng các tên được chỉ định trong hướng dẫn dự án (Quy tắc 3).
    event = wh.verify(payload.toString(), {
      'webhook-id': webhook_id,
      'webhook-timestamp': webhook_timestamp,
      'webhook-signature': webhook_signature,
    }) as WebhookEvent;
  } catch (err) {
    // Ghi lỗi xác minh chữ ký webhook để gỡ lỗi nội bộ.
    console.error('WEBHOOK_ERROR: Xác minh chữ ký webhook thất bại.', err);
    return res.status(400).json({ error: 'Xác minh chữ ký webhook thất bại.' });
  }

  // 'event.data' từ Svix thường chứa payload sự kiện thực tế từ người gửi.
  // Nó có thể là một JSON dạng chuỗi hoặc đã là một đối tượng.
  let polarEvent: PolarWebhookEvent;
  try {
    // Cố gắng phân tích nếu nó là một chuỗi, ngược lại giả định nó đã là một đối tượng.
    polarEvent = typeof event.data === 'string'
      ? JSON.parse(event.data)
      : event.data as PolarWebhookEvent;
  } catch (parseErr) {
    console.error('WEBHOOK_ERROR: Không thể phân tích dữ liệu sự kiện Polar từ payload Svix.', parseErr);
    return res.status(400).json({ error: 'Định dạng dữ liệu sự kiện Polar không hợp lệ.' });
  }

  try {
    // Đảm bảo loại sự kiện và payload tồn tại
    if (!polarEvent || !polarEvent.type || !polarEvent.payload) {
      console.warn('WEBHOOK_WARNING: Đã nhận sự kiện Polar bị lỗi định dạng (không có type hoặc payload).', polarEvent);
      return res.status(400).json({ error: 'Đã nhận sự kiện Polar bị lỗi định dạng.' });
    }

    // Trích xuất định danh người dùng từ payload sự kiện Polar.
    // Điều chỉnh các đường dẫn này dựa trên cấu trúc sự kiện Polar.sh thực tế cho subscriber/user ID.
    const userId = polarEvent.payload.subscriber_id || polarEvent.payload.user?.id;

    if (!userId) {
      console.warn('WEBHOOK_WARNING: Sự kiện webhook thiếu định danh người dùng có thể nhận dạng được.', polarEvent);
      return res.status(400).json({ error: 'Sự kiện webhook thiếu định danh người dùng.' });
    }

    // Giả định các hoạt động DB này là bất đồng bộ và trả về một Promise.
    let userSubscription: UserSubscription = await findOrCreateUserSubscription(userId);
    let subscriptionModified = false; // Cờ để theo dõi nếu subscription đã bị thay đổi

    // Xử lý các loại sự kiện Polar.sh khác nhau để cập nhật trạng thái subscription và số dư tín dụng.
    switch (polarEvent.type) {
      case 'subscription.created':
        userSubscription.status = polarEvent.payload.status === 'active' ? 'active' : 'inactive';
        userSubscription.tier = polarEvent.payload.product_id || 'basic'; // Mặc định là 'basic' nếu product_id thiếu

        // Cấp tín dụng ban đầu khi tạo subscription.
        // Đây là điểm tích hợp chính để kết nối subscription Polar với hệ thống tín dụng của bạn.
        if (userSubscription.tier === 'pro_tier_id') { // Sử dụng ID tier nhất quán
          userSubscription.currentCredits += 500; // Ví dụ: Cấp 500 tín dụng cho tier Pro
        } else if (userSubscription.tier === 'basic') {
          userSubscription.currentCredits += 100; // Ví dụ: Cấp 100 tín dụng cho tier Basic
        }
        subscriptionModified = true;
        break;

      case 'subscription.updated':
        // Cập nhật trạng thái và tier, nhưng không cấp lại tín dụng ban đầu.
        // Tín dụng có thể được điều chỉnh nếu sự kiện 'updated' cũng ngụ ý một kịch bản 'tier_changed',
        // nhưng 'tier_changed' có sự kiện riêng. Vì vậy, trường hợp này chủ yếu xử lý thay đổi trạng thái.
        userSubscription.status = polarEvent.payload.status === 'active' ? 'active' : 'inactive';
        userSubscription.tier = polarEvent.payload.product_id || userSubscription.tier; // Cập nhật tier nếu được cung cấp, nếu không giữ nguyên hiện có
        subscriptionModified = true;
        break;

      case 'subscription.cancelled':
        userSubscription.status = 'cancelled';
        // Bạn có thể chọn hết hạn tín dụng ngay lập tức hoặc sau một thời gian ân hạn.
        // Trong ví dụ này, tín dụng vẫn còn nhưng trạng thái bị hủy, ngăn chặn việc sử dụng thêm.
        subscriptionModified = true;
        break;

      case 'subscription.tier_changed':
        const newTier = polarEvent.payload.new_product_id;
        const oldTier = polarEvent.payload.old_product_id;

        if (newTier) {
          userSubscription.tier = newTier;
          // Tùy chọn điều chỉnh tín dụng dựa trên tier mới, ví dụ: phân chia theo tỷ lệ hoặc cấp lô mới.
          // Ví dụ: Thêm tiền thưởng nếu nâng cấp từ basic lên pro
          if (newTier === 'pro_tier_id' && oldTier === 'basic') { // Sử dụng ID tier nhất quán
            userSubscription.currentCredits += 200;
          }
          // Có thể đặt lại hoặc cấp lô tín dụng mới cho tier mới
          // Logic này phụ thuộc vào yêu cầu kinh doanh chính xác. Ví dụ: nếu một chu kỳ subscription mới bắt đầu.
        }
        subscriptionModified = true;
        break;

      // Triển khai các trình xử lý cho các sự kiện Polar.sh liên quan khác (ví dụ: 'pledge.created', 'issue.created')
      // nếu chúng ảnh hưởng đến logic tùy chỉnh của bạn cho người dùng hoặc tín dụng.
      default:
        // Ghi lại các loại sự kiện không được xử lý để dễ quan sát.
        console.info(`WEBHOOK_INFO: Đã nhận loại sự kiện Polar không được xử lý: ${polarEvent.type} cho người dùng: ${userId}`);
        break;
    }

    // Chỉ cập nhật cơ sở dữ liệu nếu đối tượng subscription thực sự bị sửa đổi
    if (subscriptionModified) {
      await updateUserSubscription(userSubscription);
    }

    res.status(200).json({ message: 'Webhook đã nhận và xử lý thành công.' });
  } catch (error) {
    console.error('SERVER_ERROR: Lỗi máy chủ nội bộ khi xử lý webhook Polar.', error);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ khi xử lý webhook.' });
  }
});

export default router;