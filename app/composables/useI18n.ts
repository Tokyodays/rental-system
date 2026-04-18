import { useCookie } from '#app'

export type Locale = 'en' | 'th' | 'la' | 'vi' | 'ms'

export const useI18n = () => {
  const locale = useCookie<Locale>('locale', { default: () => 'en' })
  const translations: Record<Locale, Record<string, string>> = {
    en: {
      dashboard: 'Dashboard',
      vehicles: 'Vehicles',
      lending: 'Lending',
      return: 'Return',
      customers: 'Customers',
      history: 'History',
      settings: 'Settings',
      store_management: 'Store Management',
      logout: 'Logout',
      profile: 'Profile',
      username: 'Username',
      password: 'Password',
      login: 'Login',
      store_info: 'Store Info',
      language: 'Language',
      save: 'Save',
      add: 'Add',
      edit: 'Edit',
      delete: 'Delete',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      search: 'Search',
      status: 'Status',
      loading: 'Loading...',
      none: 'None',
      store_name: 'Store Name',
      store_address: 'Store Address',
      currency: 'Currency',
      full_name: 'Full Name',
      staff_members: 'Staff Members',
      actions: 'Actions',
      role: 'Role'
    },
    th: {
      dashboard: 'แดชบอร์ด',
      vehicles: 'จัดการรถ',
      lending: 'ลงทะเบียนยืม',
      return: 'ลงทะเบียนคืน',
      customers: 'จัดการลูกค้า',
      history: 'ประวัติ',
      settings: 'ตั้งค่า',
      store_management: 'การจัดการร้านค้า',
      logout: 'ออกจากระบบ',
      profile: 'โปรไฟล์',
      username: 'ชื่อผู้ใช้',
      password: 'รหัสผ่าน',
      login: 'เข้าสู่ระบบ',
      store_info: 'ข้อมูลร้าน',
      language: 'ภาษา',
      save: 'บันทึก',
      add: 'เพิ่ม',
      edit: 'แก้ไข',
      delete: 'ลบ',
      cancel: 'ยกเลิก',
      confirm: 'ยืนยัน',
      back: 'กลับ',
      search: 'ค้นหา',
      status: 'สถานะ',
      loading: 'กำลังโหลด...',
      none: 'ไม่มี',
      store_name: 'ชื่อร้าน',
      store_address: 'ที่อยู่ร้าน',
      currency: 'สกุลเงิน',
      full_name: 'ชื่อ-นามสกุล',
      staff_members: 'พนักงาน',
      actions: 'ดำเนินการ',
      role: 'บทบาท'
    },
    la: {
      dashboard: 'ແຜງຄວບຄຸມ',
      vehicles: 'ຈັດການລົດ',
      lending: 'ລົງທະບຽນການຢືມ',
      return: 'ລົງທະບຽນການຄືນ',
      customers: 'ຈັດການລູກຄ້າ',
      history: 'ປະຫວັດ',
      settings: 'ຕັ້ງຄ່າ',
      store_management: 'ການຈັດการร้าน',
      logout: 'ອອກຈາກລະບົບ',
      profile: 'ໂປຣໄຟລ໌',
      username: 'ຊື່ຜູ້ໃຊ້',
      password: 'ລະຫັດຜ່ານ',
      login: 'ເຂົ້າສູ່ລະບົບ',
      store_info: 'ຂໍ້ມູນຮ້ານ',
      language: 'ພາສາ',
      save: 'ບັນທຶກ',
      add: 'ເພີ່ມ',
      edit: 'ແກ້ໄຂ',
      delete: 'ລົບ',
      cancel: 'ຍົກເລີກ',
      confirm: 'ຢືນຢັນ',
      back: 'ກັບຄືນ',
      search: 'ຄົ້ນຫາ',
      status: 'ສະຖານະ',
      loading: 'ກຳລັງໂຫລດ...',
      none: 'ບໍ່ມີ',
      store_name: 'ຊື່ຮ້ານ',
      store_address: 'ທີ່ຢູ່ຮ້ານ',
      currency: 'ສະກຸນເງິນ',
      full_name: 'ຊື່ເຕັມ',
      staff_members: 'ພະນັກງານ',
      actions: 'ການຈັດການ',
      role: 'ບົດບາດ'
    },
    vi: {
      dashboard: 'Bảng điều khiển',
      vehicles: 'Quản lý xe',
      lending: 'Đăng ký thuê',
      return: 'Đăng ký trả',
      customers: 'Quản lý khách',
      history: 'Lịch sử',
      settings: 'Cài đặt',
      store_management: 'Quản lý cửa hàng',
      logout: 'Đăng xuất',
      profile: 'Hồ sơ',
      username: 'Tên đăng nhập',
      password: 'Mật khẩu',
      login: 'Đăng nhập',
      store_info: 'Thông tin cửa hàng',
      language: 'Ngôn ngữ',
      save: 'Lưu',
      add: 'Thêm',
      edit: 'Sửa',
      delete: 'Xóa',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      back: 'Quay lại',
      search: 'Tìm kiếm',
      status: 'Trạng thái',
      loading: 'Đang tải...',
      none: 'Không có',
      store_name: 'Tên cửa hàng',
      store_address: 'Địa chỉ',
      currency: 'Tiền tệ',
      full_name: 'Họ tên',
      staff_members: 'Nhân viên',
      actions: 'Thao tác',
      role: 'Vai trò'
    },
    ms: {
      dashboard: 'Papan Pemuka',
      vehicles: 'Pengurusan Kenderaan',
      lending: 'Pendaftaran Pinjaman',
      return: 'Pendaftaran Pemulangan',
      customers: 'Pengurusan Pelanggan',
      history: 'Sejarah',
      settings: 'Tetapan',
      store_management: 'Pengurusan Kedai',
      logout: 'Log Keluar',
      profile: 'Profil',
      username: 'Nama Pengguna',
      password: 'Kata Laluan',
      login: 'Log Masuk',
      store_info: 'Maklumat Kedai',
      language: 'Bahasa Paparan',
      save: 'Simpan',
      add: 'Tambah',
      edit: 'Sunting',
      delete: 'Padam',
      cancel: 'Batal',
      confirm: 'Sahkan',
      back: 'Kembali',
      search: 'Cari',
      status: 'Status',
      loading: 'Memuatkan...',
      none: 'Tiada',
      store_name: 'Nama Kedai',
      store_address: 'Alamat Kedai',
      currency: 'Mata Wang',
      full_name: 'Nama Penuh',
      staff_members: 'Ahli Kakitangan',
      actions: 'Tindakan',
      role: 'Peranan'
    }
  }

  const t = (key: string) => {
    return translations[locale.value]?.[key] || key
  }

  const setLocale = (newLocale: Locale) => {
    locale.value = newLocale
  }

  // 店舗のデフォルト言語設定と同期するロジック
  const { staff } = useStaff()
  if (process.client) {
    watch(() => staff.value?.stores?.default_locale, (newDefault) => {
      if (newDefault && newDefault !== locale.value) {
        locale.value = newDefault as Locale
      }
    }, { immediate: true })
  }

  return {
    locale,
    t,
    setLocale,
    availableLocales: [
      { label: 'English', value: 'en', icon: '🇺🇸' },
      { label: 'ไทย', value: 'th', icon: '🇹🇭' },
      { label: 'ລາວ', value: 'la', icon: '🇱🇦' },
      { label: 'Tiếng Việt', value: 'vi', icon: '🇻🇳' },
      { label: 'Bahasa Melayu', value: 'ms', icon: '🇲🇾' }
    ]
  }
}
