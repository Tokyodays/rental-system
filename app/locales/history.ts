import type { MessageCatalog } from './types'

export default {
  'hist.search': { en: 'Search items or users...', th: 'ค้นหารายการหรือผู้ใช้...', lo: 'ຄົ້ນຫາລາຍການ ຫຼື ຜູ້ໃຊ້...', vi: 'Tìm hạng mục hoặc người dùng...', ms: 'Cari item atau pengguna...' },
  'hist.month': { en: 'Month:', th: 'เดือน:', lo: 'ເດືອນ:', vi: 'Tháng:', ms: 'Bulan:' },
  'hist.export': { en: 'Export', th: 'ส่งออก', lo: 'ສົ່ງອອກ', vi: 'Xuất', ms: 'Eksport' },
  'hist.col.id': { en: 'ID', th: 'รหัส', lo: 'ລະຫັດ', vi: 'Mã', ms: 'ID' },
  'hist.col.item': { en: 'Item', th: 'รายการ', lo: 'ລາຍການ', vi: 'Hạng mục', ms: 'Item' },
  'hist.col.user': { en: 'User', th: 'ผู้ใช้', lo: 'ຜູ້ໃຊ້', vi: 'Người dùng', ms: 'Pengguna' },
  'hist.col.lending': { en: 'Lending Time', th: 'เวลาให้เช่า', lo: 'ເວລາໃຫ້ເຊົ່າ', vi: 'Giờ cho thuê', ms: 'Masa Penyewaan' },
  'hist.col.returned': { en: 'Returned Time', th: 'เวลาคืน', lo: 'ເວລາຄືນ', vi: 'Giờ trả', ms: 'Masa Dipulangkan' },
  'hist.col.duration': { en: 'Duration', th: 'ระยะเวลา', lo: 'ໄລຍະເວລາ', vi: 'Thời lượng', ms: 'Tempoh' },
  'hist.col.price': { en: 'Price', th: 'ราคา', lo: 'ລາຄາ', vi: 'Giá', ms: 'Harga' },
  'hist.badge_lending': { en: 'Lending', th: 'กำลังเช่า', lo: 'ກຳລັງເຊົ່າ', vi: 'Đang thuê', ms: 'Sedang disewa' },
  'hist.expected_return': { en: 'Expected Return:', th: 'กำหนดคืน:', lo: 'ກຳນົດຄືນ:', vi: 'Dự kiến trả:', ms: 'Jangkaan Pulang:' },
  'hist.empty': { en: 'No transactions found.', th: 'ไม่พบธุรกรรม', lo: 'ບໍ່ພົບທຸລະກຳ', vi: 'Không tìm thấy giao dịch.', ms: 'Tiada transaksi ditemui.' },
  'hist.total_tx': { en: 'Total Transactions', th: 'ธุรกรรมทั้งหมด', lo: 'ທຸລະກຳທັງໝົດ', vi: 'Tổng số giao dịch', ms: 'Jumlah Transaksi' },
  'hist.total_amount': { en: 'Total Amount', th: 'ยอดรวม', lo: 'ຍອດລວມ', vi: 'Tổng số tiền', ms: 'Jumlah Keseluruhan' },

  'hist.export.title': { en: 'Export Transactions', th: 'ส่งออกธุรกรรม', lo: 'ສົ່ງອອກທຸລະກຳ', vi: 'Xuất giao dịch', ms: 'Eksport Transaksi' },
  'hist.export.desc': { en: 'Select a date range to export transaction history.', th: 'เลือกช่วงวันที่เพื่อส่งออกประวัติธุรกรรม', lo: 'ເລືອກຊ່ວງວັນທີເພື່ອສົ່ງອອກປະຫວັດທຸລະກຳ', vi: 'Chọn khoảng ngày để xuất lịch sử giao dịch.', ms: 'Pilih julat tarikh untuk mengeksport sejarah transaksi.' },
  'hist.export.start': { en: 'Start Date', th: 'วันที่เริ่มต้น', lo: 'ວັນທີເລີ່ມຕົ້ນ', vi: 'Ngày bắt đầu', ms: 'Tarikh Mula' },
  'hist.export.end': { en: 'End Date', th: 'วันที่สิ้นสุด', lo: 'ວັນທີສິ້ນສຸດ', vi: 'Ngày kết thúc', ms: 'Tarikh Tamat' },
  'hist.export.download': { en: 'Download CSV', th: 'ดาวน์โหลด CSV', lo: 'ດາວໂຫລດ CSV', vi: 'Tải CSV', ms: 'Muat Turun CSV' },
  'hist.export.need_dates': { en: 'Please select both start and end dates.', th: 'โปรดเลือกทั้งวันที่เริ่มต้นและวันที่สิ้นสุด', lo: 'ກະລຸນາເລືອກທັງວັນທີເລີ່ມຕົ້ນ ແລະ ວັນທີສິ້ນສຸດ', vi: 'Vui lòng chọn cả ngày bắt đầu và ngày kết thúc.', ms: 'Sila pilih tarikh mula dan tarikh tamat.' },
  'hist.export.no_data': { en: 'No Data', th: 'ไม่มีข้อมูล', lo: 'ບໍ່ມີຂໍ້ມູນ', vi: 'Không có dữ liệu', ms: 'Tiada Data' },
  'hist.export.no_data_desc': { en: 'No transactions found in this date range.', th: 'ไม่พบธุรกรรมในช่วงวันที่นี้', lo: 'ບໍ່ພົບທຸລະກຳໃນຊ່ວງວັນທີນີ້', vi: 'Không có giao dịch trong khoảng ngày này.', ms: 'Tiada transaksi ditemui dalam julat tarikh ini.' },
  'hist.export.done_desc': { en: 'Data exported successfully.', th: 'ส่งออกข้อมูลเรียบร้อยแล้ว', lo: 'ສົ່ງອອກຂໍ້ມູນຮຽບຮ້ອຍແລ້ວ', vi: 'Đã xuất dữ liệu thành công.', ms: 'Data berjaya dieksport.' }
} satisfies MessageCatalog
