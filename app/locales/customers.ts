import type { MessageCatalog } from './types'

export default {
  'cust.search': { en: 'Search customers...', th: 'ค้นหาลูกค้า...', lo: 'ຄົ້ນຫາລູກຄ້າ...', vi: 'Tìm khách hàng...', ms: 'Cari pelanggan...' },
  'cust.all_statuses': { en: 'All Statuses', th: 'ทุกสถานะ', lo: 'ທຸກສະຖານະ', vi: 'Mọi trạng thái', ms: 'Semua Status' },
  'cust.add': { en: 'Add New Customer', th: 'เพิ่มลูกค้าใหม่', lo: 'ເພີ່ມລູກຄ້າໃໝ່', vi: 'Thêm khách hàng mới', ms: 'Tambah Pelanggan Baharu' },
  'cust.loading': { en: 'Loading customers...', th: 'กำลังโหลดลูกค้า...', lo: 'ກຳລັງໂຫລດລູກຄ້າ...', vi: 'Đang tải khách hàng...', ms: 'Memuatkan pelanggan...' },
  'cust.error': { en: 'Error: {message}', th: 'ข้อผิดพลาด: {message}', lo: 'ຂໍ້ຜິດພາດ: {message}', vi: 'Lỗi: {message}', ms: 'Ralat: {message}' },
  'cust.col.name': { en: 'Name', th: 'ชื่อ', lo: 'ຊື່', vi: 'Tên', ms: 'Nama' },
  'cust.col.contact': { en: 'Contact', th: 'ติดต่อ', lo: 'ຕິດຕໍ່', vi: 'Liên hệ', ms: 'Hubungan' },
  'cust.col.docs': { en: 'Docs', th: 'เอกสาร', lo: 'ເອກະສານ', vi: 'Giấy tờ', ms: 'Dokumen' },

  // ---- add modal ----
  'cust.add.title': { en: 'Add New Customer', th: 'เพิ่มลูกค้าใหม่', lo: 'ເພີ່ມລູກຄ້າໃໝ່', vi: 'Thêm khách hàng mới', ms: 'Tambah Pelanggan Baharu' },
  'cust.add.photo_title': { en: 'Take Passport Photo', th: 'ถ่ายรูปหนังสือเดินทาง', lo: 'ຖ່າຍຮູບໜັງສືຜ່ານແດນ', vi: 'Chụp ảnh hộ chiếu', ms: 'Ambil Foto Pasport' },
  'cust.add.desc': { en: 'Register a new customer to the system.', th: 'ลงทะเบียนลูกค้าใหม่เข้าสู่ระบบ', lo: 'ລົງທະບຽນລູກຄ້າໃໝ່ເຂົ້າລະບົບ', vi: 'Đăng ký khách hàng mới vào hệ thống.', ms: 'Daftarkan pelanggan baharu ke dalam sistem.' },
  'cust.add.photo_desc': { en: 'Scan or take a photo of the passport identification page.', th: 'สแกนหรือถ่ายรูปหน้าข้อมูลของหนังสือเดินทาง', lo: 'ສະແກນ ຫຼື ຖ່າຍຮູບໜ້າຂໍ້ມູນຂອງໜັງສືຜ່ານແດນ', vi: 'Quét hoặc chụp ảnh trang thông tin của hộ chiếu.', ms: 'Imbas atau ambil foto halaman pengenalan pasport.' },
  'cust.field.full_name': { en: 'Full Name', th: 'ชื่อ-นามสกุล', lo: 'ຊື່ ແລະ ນາມສະກຸນ', vi: 'Họ và tên', ms: 'Nama Penuh' },
  'cust.field.full_name_ph': { en: 'e.g. John Doe', th: 'เช่น John Doe', lo: 'ເຊັ່ນ John Doe', vi: 'VD: John Doe', ms: 'cth. John Doe' },
  'cust.field.email': { en: 'Email Address', th: 'อีเมล', lo: 'ອີເມວ', vi: 'Địa chỉ email', ms: 'Alamat E-mel' },
  'cust.field.phone': { en: 'Phone Number', th: 'หมายเลขโทรศัพท์', lo: 'ເບີໂທລະສັບ', vi: 'Số điện thoại', ms: 'Nombor Telefon' },
  'cust.field.passport': { en: 'Passport Number', th: 'หมายเลขหนังสือเดินทาง', lo: 'ເລກໜັງສືຜ່ານແດນ', vi: 'Số hộ chiếu', ms: 'Nombor Pasport' },
  'cust.field.passport_ph': { en: 'e.g. TK1234567', th: 'เช่น TK1234567', lo: 'ເຊັ່ນ TK1234567', vi: 'VD: TK1234567', ms: 'cth. TK1234567' },
  'cust.add.next': { en: 'Next: Passport Photo', th: 'ถัดไป: รูปหนังสือเดินทาง', lo: 'ຕໍ່ໄປ: ຮູບໜັງສືຜ່ານແດນ', vi: 'Tiếp theo: Ảnh hộ chiếu', ms: 'Seterusnya: Foto Pasport' },
  'cust.add.register': { en: 'Register Customer', th: 'ลงทะเบียนลูกค้า', lo: 'ລົງທະບຽນລູກຄ້າ', vi: 'Đăng ký khách hàng', ms: 'Daftar Pelanggan' },
  'cust.add.take_hint': { en: 'Take a photo of the passport identification page.', th: 'ถ่ายรูปหน้าข้อมูลของหนังสือเดินทาง', lo: 'ຖ່າຍຮູບໜ້າຂໍ້ມູນຂອງໜັງສືຜ່ານແດນ', vi: 'Chụp ảnh trang thông tin của hộ chiếu.', ms: 'Ambil foto halaman pengenalan pasport.' },
  'cust.add.open_camera': { en: 'Open Camera', th: 'เปิดกล้อง', lo: 'ເປີດກ້ອງ', vi: 'Mở camera', ms: 'Buka Kamera' },
  'cust.add.retake': { en: 'Retake', th: 'ถ่ายใหม่', lo: 'ຖ່າຍໃໝ່', vi: 'Chụp lại', ms: 'Ambil Semula' },
  'cust.add.skip': { en: 'Skip and Register', th: 'ข้ามและลงทะเบียน', lo: 'ຂ້າມ ແລະ ລົງທະບຽນ', vi: 'Bỏ qua và đăng ký', ms: 'Langkau dan Daftar' },
  'cust.add.back': { en: 'Back to Info', th: 'กลับไปหน้าข้อมูล', lo: 'ກັບໄປໜ້າຂໍ້ມູນ', vi: 'Quay lại thông tin', ms: 'Kembali ke Maklumat' },
  'cust.toast.registered': { en: 'Customer registered with passport successfully.', th: 'ลงทะเบียนลูกค้าพร้อมหนังสือเดินทางเรียบร้อยแล้ว', lo: 'ລົງທະບຽນລູກຄ້າພ້ອມໜັງສືຜ່ານແດນຮຽບຮ້ອຍແລ້ວ', vi: 'Đã đăng ký khách hàng kèm hộ chiếu thành công.', ms: 'Pelanggan berjaya didaftarkan bersama pasport.' },
  'cust.toast.register_failed': { en: 'Registration Failed', th: 'ลงทะเบียนไม่สำเร็จ', lo: 'ລົງທະບຽນບໍ່ສຳເລັດ', vi: 'Đăng ký thất bại', ms: 'Pendaftaran gagal' },
  'cust.toast.register_failed_desc': { en: 'Check your input or network connection.', th: 'ตรวจสอบข้อมูลที่กรอกหรือการเชื่อมต่ออินเทอร์เน็ต', lo: 'ກວດສອບຂໍ້ມູນທີ່ປ້ອນ ຫຼື ການເຊື່ອມຕໍ່ອິນເຕີເນັດ', vi: 'Kiểm tra dữ liệu nhập hoặc kết nối mạng.', ms: 'Semak input atau sambungan rangkaian anda.' },
  'cust.err.no_store': { en: 'Store ID not found.', th: 'ไม่พบรหัสร้านค้า', lo: 'ບໍ່ພົບລະຫັດຮ້ານ', vi: 'Không tìm thấy mã cửa hàng.', ms: 'ID kedai tidak ditemui.' },

  // ---- delete modal ----
  'cust.del.title': { en: 'Delete Customer', th: 'ลบลูกค้า', lo: 'ລຶບລູກຄ້າ', vi: 'Xóa khách hàng', ms: 'Padam Pelanggan' },
  'cust.del.desc': { en: 'Are you sure you want to delete this customer? This action cannot be undone.', th: 'คุณแน่ใจหรือไม่ว่าต้องการลบลูกค้ารายนี้ การดำเนินการนี้ไม่สามารถย้อนกลับได้', lo: 'ທ່ານແນ່ໃຈບໍວ່າຕ້ອງການລຶບລູກຄ້ານີ້ ການດຳເນີນການນີ້ບໍ່ສາມາດຍ້ອນກັບໄດ້', vi: 'Bạn có chắc muốn xóa khách hàng này? Hành động này không thể hoàn tác.', ms: 'Adakah anda pasti mahu memadam pelanggan ini? Tindakan ini tidak boleh dibatalkan.' },
  'cust.del.target': { en: 'Customer to be deleted', th: 'ลูกค้าที่จะถูกลบ', lo: 'ລູກຄ້າທີ່ຈະຖືກລຶບ', vi: 'Khách hàng sẽ bị xóa', ms: 'Pelanggan yang akan dipadam' },
  'cust.toast.deleted': { en: 'Customer Deleted', th: 'ลบลูกค้าแล้ว', lo: 'ລຶບລູກຄ້າແລ້ວ', vi: 'Đã xóa khách hàng', ms: 'Pelanggan dipadam' },
  'cust.toast.deleted_desc': { en: 'The customer has been removed successfully.', th: 'ลบลูกค้าเรียบร้อยแล้ว', lo: 'ລຶບລູກຄ້າຮຽບຮ້ອຍແລ້ວ', vi: 'Khách hàng đã được xóa.', ms: 'Pelanggan telah berjaya dibuang.' },
  'cust.toast.delete_failed': { en: 'Delete Failed', th: 'ลบไม่สำเร็จ', lo: 'ລຶບບໍ່ສຳເລັດ', vi: 'Xóa thất bại', ms: 'Pemadaman gagal' },
  'cust.toast.delete_failed_desc': { en: 'Failed to delete customer.', th: 'ไม่สามารถลบลูกค้าได้', lo: 'ບໍ່ສາມາດລຶບລູກຄ້າໄດ້', vi: 'Không thể xóa khách hàng.', ms: 'Gagal memadam pelanggan.' },

  // ---- update modal ----
  'cust.upd.title': { en: 'Update Customer', th: 'อัปเดตลูกค้า', lo: 'ອັບເດດລູກຄ້າ', vi: 'Cập nhật khách hàng', ms: 'Kemas Kini Pelanggan' },
  'cust.upd.desc': { en: 'Update the information for this customer.', th: 'อัปเดตข้อมูลของลูกค้ารายนี้', lo: 'ອັບເດດຂໍ້ມູນຂອງລູກຄ້ານີ້', vi: 'Cập nhật thông tin của khách hàng này.', ms: 'Kemas kini maklumat pelanggan ini.' },
  'cust.upd.photo': { en: 'Passport Photo', th: 'รูปหนังสือเดินทาง', lo: 'ຮູບໜັງສືຜ່ານແດນ', vi: 'Ảnh hộ chiếu', ms: 'Foto Pasport' },
  'cust.upd.change_photo': { en: 'Change Photo', th: 'เปลี่ยนรูป', lo: 'ປ່ຽນຮູບ', vi: 'Đổi ảnh', ms: 'Tukar Foto' },
  'cust.upd.update_photo': { en: 'Update Photo', th: 'อัปเดตรูป', lo: 'ອັບເດດຮູບ', vi: 'Cập nhật ảnh', ms: 'Kemas Kini Foto' },
  'cust.upd.new_photo': { en: 'New photo selected', th: 'เลือกรูปใหม่แล้ว', lo: 'ເລືອກຮູບໃໝ່ແລ້ວ', vi: 'Đã chọn ảnh mới', ms: 'Foto baharu dipilih' },
  'cust.upd.new_photo_hint': { en: 'Will be saved upon update', th: 'จะบันทึกเมื่อกดอัปเดต', lo: 'ຈະບັນທຶກເມື່ອກົດອັບເດດ', vi: 'Sẽ được lưu khi cập nhật', ms: 'Akan disimpan apabila dikemas kini' },
  'cust.upd.renting': { en: 'Status cannot be changed while renting.', th: 'ไม่สามารถเปลี่ยนสถานะได้ขณะที่กำลังเช่า', lo: 'ບໍ່ສາມາດປ່ຽນສະຖານະໄດ້ໃນຂະນະທີ່ກຳລັງເຊົ່າ', vi: 'Không thể đổi trạng thái khi đang thuê.', ms: 'Status tidak boleh diubah semasa menyewa.' },
  'cust.upd.status_desc': { en: 'Select the customer status.', th: 'เลือกสถานะของลูกค้า', lo: 'ເລືອກສະຖານະຂອງລູກຄ້າ', vi: 'Chọn trạng thái của khách hàng.', ms: 'Pilih status pelanggan.' },
  'cust.upd.submit': { en: 'Update Customer', th: 'อัปเดตลูกค้า', lo: 'ອັບເດດລູກຄ້າ', vi: 'Cập nhật khách hàng', ms: 'Kemas Kini Pelanggan' },
  'cust.toast.updated': { en: 'Customer Updated', th: 'อัปเดตลูกค้าแล้ว', lo: 'ອັບເດດລູກຄ້າແລ້ວ', vi: 'Đã cập nhật khách hàng', ms: 'Pelanggan dikemas kini' },
  'cust.toast.updated_desc': { en: 'The customer information has been updated successfully.', th: 'อัปเดตข้อมูลลูกค้าเรียบร้อยแล้ว', lo: 'ອັບເດດຂໍ້ມູນລູກຄ້າຮຽບຮ້ອຍແລ້ວ', vi: 'Thông tin khách hàng đã được cập nhật.', ms: 'Maklumat pelanggan telah berjaya dikemas kini.' },
  'cust.toast.update_failed_desc': { en: 'Failed to update customer.', th: 'ไม่สามารถอัปเดตลูกค้าได้', lo: 'ບໍ່ສາມາດອັບເດດລູກຄ້າໄດ້', vi: 'Không thể cập nhật khách hàng.', ms: 'Gagal mengemas kini pelanggan.' },

  // ---- detail pane ----
  'cust.pane.title': { en: 'Customer Profile', th: 'ข้อมูลลูกค้า', lo: 'ຂໍ້ມູນລູກຄ້າ', vi: 'Hồ sơ khách hàng', ms: 'Profil Pelanggan' },
  'cust.pane.no_photo': { en: 'No Passport Photo', th: 'ไม่มีรูปหนังสือเดินทาง', lo: 'ບໍ່ມີຮູບໜັງສືຜ່ານແດນ', vi: 'Chưa có ảnh hộ chiếu', ms: 'Tiada Foto Pasport' },
  'cust.pane.edit': { en: 'Edit Info', th: 'แก้ไขข้อมูล', lo: 'ແກ້ໄຂຂໍ້ມູນ', vi: 'Sửa thông tin', ms: 'Sunting Maklumat' },
  'cust.pane.registered': { en: 'Registered At', th: 'ลงทะเบียนเมื่อ', lo: 'ລົງທະບຽນເມື່ອ', vi: 'Ngày đăng ký', ms: 'Didaftarkan Pada' },
  'cust.pane.id': { en: 'ID', th: 'รหัส', lo: 'ລະຫັດ', vi: 'Mã', ms: 'ID' },
  'cust.pane.history': { en: 'Rental History', th: 'ประวัติการเช่า', lo: 'ປະຫວັດການເຊົ່າ', vi: 'Lịch sử thuê', ms: 'Sejarah Sewaan' },
  'cust.pane.loading_history': { en: 'Loading history...', th: 'กำลังโหลดประวัติ...', lo: 'ກຳລັງໂຫລດປະຫວັດ...', vi: 'Đang tải lịch sử...', ms: 'Memuatkan sejarah...' },
  'cust.pane.no_history': { en: 'No rental records found.', th: 'ไม่พบประวัติการเช่า', lo: 'ບໍ່ພົບປະຫວັດການເຊົ່າ', vi: 'Chưa có lượt thuê nào.', ms: 'Tiada rekod sewaan ditemui.' }
} satisfies MessageCatalog
