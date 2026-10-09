import type { MessageCatalog } from './types'

export default {
  'dash.overview': { en: 'Overview', th: 'ภาพรวม', lo: 'ພາບລວມ', vi: 'Tổng quan', ms: 'Gambaran Keseluruhan' },
  'dash.subtitle': { en: "Check today's rental and return status.", th: 'ตรวจสอบสถานะการเช่าและการคืนของวันนี้', lo: 'ກວດສອບສະຖານະການເຊົ່າ ແລະ ການຄືນຂອງມື້ນີ້', vi: 'Xem tình hình thuê và trả xe hôm nay.', ms: 'Semak status sewaan dan pemulangan hari ini.' },
  'dash.stat.lending': { en: 'Lending', th: 'กำลังให้เช่า', lo: 'ກຳລັງໃຫ້ເຊົ່າ', vi: 'Đang cho thuê', ms: 'Sedang disewa' },
  'dash.stat.available': { en: 'Available', th: 'ว่าง', lo: 'ຫວ່າງ', vi: 'Sẵn sàng', ms: 'Tersedia' },
  'dash.stat.today': { en: "Today's Transactions", th: 'ธุรกรรมวันนี้', lo: 'ທຸລະກຳມື້ນີ້', vi: 'Giao dịch hôm nay', ms: 'Transaksi Hari Ini' },
  'dash.recent': { en: 'Recent Transactions', th: 'ธุรกรรมล่าสุด', lo: 'ທຸລະກຳຫຼ້າສຸດ', vi: 'Giao dịch gần đây', ms: 'Transaksi Terkini' },
  'dash.view_all': { en: 'View All', th: 'ดูทั้งหมด', lo: 'ເບິ່ງທັງໝົດ', vi: 'Xem tất cả', ms: 'Lihat Semua' },
  'dash.col.item': { en: 'Item', th: 'รายการ', lo: 'ລາຍການ', vi: 'Hạng mục', ms: 'Item' },
  'dash.col.user': { en: 'User', th: 'ผู้ใช้', lo: 'ຜູ້ໃຊ້', vi: 'Người dùng', ms: 'Pengguna' },
  'dash.col.action': { en: 'Action', th: 'การกระทำ', lo: 'ການກະທຳ', vi: 'Hành động', ms: 'Tindakan' },
  'dash.col.time': { en: 'Time', th: 'เวลา', lo: 'ເວລາ', vi: 'Thời gian', ms: 'Masa' },
  'dash.action.lend': { en: 'Lend', th: 'ให้เช่า', lo: 'ໃຫ້ເຊົ່າ', vi: 'Cho thuê', ms: 'Sewa' },
  'dash.action.return': { en: 'Return', th: 'คืน', lo: 'ຄືນ', vi: 'Trả', ms: 'Pulang' },
  'dash.loading_tx': { en: 'Loading transactions...', th: 'กำลังโหลดธุรกรรม...', lo: 'ກຳລັງໂຫລດທຸລະກຳ...', vi: 'Đang tải giao dịch...', ms: 'Memuatkan transaksi...' },
  'dash.empty': { en: 'No recent transactions found.', th: 'ไม่พบธุรกรรมล่าสุด', lo: 'ບໍ່ພົບທຸລະກຳຫຼ້າສຸດ', vi: 'Không có giao dịch gần đây.', ms: 'Tiada transaksi terkini.' }
} satisfies MessageCatalog
