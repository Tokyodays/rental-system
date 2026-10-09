// 取扱説明書 (/howtouse) の文言定義。多言語化は このファイルを差し替える/拡張することで行う。
export interface HowToUseSection {
  heading: string
  body?: string
  steps?: string[]
  bullets?: string[]
  note?: string
  image?: { src: string; alt: string }
}

export interface HowToUseGuide {
  slug: string
  icon: string
  title: string
  summary: string
  sections: HowToUseSection[]
}

const img = (name: string, alt: string) => ({ src: `/howtouse/${name}.png`, alt })

export const howToUseGuides: HowToUseGuide[] = [
  {
    slug: 'overview',
    icon: 'i-lucide-layout-dashboard',
    title: 'Reading the Overview and the menus',
    summary: 'What the Dashboard shows and what each menu item is for.',
    sections: [
      {
        heading: 'The Dashboard',
        body: 'After you sign in, the Dashboard ("Overview") shows the current state of your store at a glance.',
        image: img('overview-dashboard', 'Dashboard overview screen'),
        bullets: [
          'Lending: the number of vehicles that are currently out on rent.',
          'Available: the number of vehicles that can be lent right now.',
          "Today's Transactions: the number of lend and return events recorded today.",
          'Recent Transactions: the latest lend / return events. "Processing" means the vehicle is still out; "Completed" means it has been returned. Click "View All" to open History.',
          'The blue "Lending" button at the top right starts a new lending transaction.',
        ],
      },
      {
        heading: 'Menu items',
        body: 'Use the sidebar on the left (or the menu button on a phone) to move between screens.',
        bullets: [
          'Dashboard: the overview described above.',
          'Vehicles: the vehicle list. Register vehicles, view details and photos, and mark a vehicle Available / Unavailable.',
          'Lending: the step-by-step flow to lend a vehicle to a customer.',
          'Return: the flow to receive a lent vehicle back.',
          'Customers: the customer list. Register and edit customers and their passport photos.',
          'History: every transaction, with search, a month filter and CSV export.',
          'Settings: store settings and staff members. Shown to branch admins only.',
        ],
      },
    ],
  },
  {
    slug: 'vehicles',
    icon: 'i-lucide-package',
    title: 'Registering a vehicle',
    summary: 'Add a new vehicle to your inventory.',
    sections: [
      {
        heading: 'Before you start',
        body: 'Open "Vehicles" from the sidebar. The list can be searched and filtered by category and status.',
        image: img('vehicles-list', 'Vehicle list screen'),
      },
      {
        heading: 'Register a new vehicle',
        image: img('vehicles-add', 'Register New Vehicle dialog'),
        steps: [
          'Click "Add Vehicle" at the top right of the list.',
          'Enter the Vehicle Name (required), for example "Honda PCX 150".',
          'Choose the Category (required): Bike, Car or Bicycle.',
          'Enter the Initial Mileage in km. The default is 0.',
          'Optionally add up to 5 photos, either by taking a photo or choosing files.',
          'Click "Save Vehicle". The vehicle appears in the list with the status Available and a unique code.',
        ],
      },
      {
        heading: 'Checking and changing a vehicle',
        body: 'Click a row in the list to open the Vehicle Details panel. It shows the photos, category, unique vehicle QR / code and status.',
        image: img('vehicles-detail', 'Vehicle details panel'),
        bullets: [
          'Use "Set Unavailable" to take a vehicle out of service (for example for repairs). It will not be offered when lending. Use "Set Available" to put it back.',
          'Use "Edit Photos" to add or replace photos.',
        ],
      },
    ],
  },
  {
    slug: 'customers',
    icon: 'i-lucide-users',
    title: 'Registering a customer',
    summary: 'Add a customer before lending them a vehicle.',
    sections: [
      {
        heading: 'The customer list',
        body: 'Open "Customers" from the sidebar. Search by name, or filter by status: Active, Unactive or Renting.',
        image: img('customers-list', 'Customer list screen'),
      },
      {
        heading: 'Register a new customer',
        image: img('customers-add', 'Add New Customer dialog'),
        steps: [
          'Click "Add New Customer" at the top right.',
          'Enter the Full Name (required).',
          'Enter the Email Address (optional).',
          'Enter the Phone Number (required), including the country code, for example +81-90-1234-5678.',
          'Enter the Passport Number (optional).',
          'Click "Register Customer" to save, or click "Next: Passport Photo" to also scan or take a photo of the passport identification page before saving.',
        ],
        note: 'The passport photo can also be added later by editing the customer (pencil icon in the Actions column).',
      },
    ],
  },
  {
    slug: 'lending',
    icon: 'i-lucide-log-out',
    title: 'Lending a vehicle',
    summary: 'Five steps from choosing the customer to starting the rental.',
    sections: [
      {
        heading: 'Before you start',
        bullets: [
          'The customer must already be registered (see "Registering a customer").',
          'The vehicle must be registered and have the status Available.',
        ],
        body: 'Click "Lending" in the sidebar, or the blue "Lending" button on the Dashboard.',
      },
      {
        heading: 'Step 1: Select Customer',
        body: 'Search by name or email and click the customer card.',
        image: img('lending-step1', 'Lending step 1: select customer'),
      },
      {
        heading: 'Step 2: Select Vehicle',
        body: 'Click an available vehicle card. You can search by name, code or category. If you have the vehicle QR code, you can instead type the Vehicle ID (Code) and click "Identify Vehicle".',
        image: img('lending-step2', 'Lending step 2: select vehicle'),
      },
      {
        heading: 'Step 3: Return Schedule',
        body: 'Set the Return Date and Return Time the customer has agreed to, then click "Continue to Price Input".',
        image: img('lending-step3', 'Lending step 3: return schedule'),
      },
      {
        heading: 'Step 4: Payment Amount',
        body: 'Enter the Rental Price you collected, then click "Continue to Confirmation".',
        image: img('lending-step4', 'Lending step 4: payment amount'),
      },
      {
        heading: 'Step 5: Confirm Transaction',
        body: 'Check the customer, vehicle, return schedule and price. Use "Change" next to the schedule or price to correct them. When everything is right, click "Start Lending Now".',
        image: img('lending-step5', 'Lending step 5: confirm transaction'),
        note: 'The vehicle becomes "Lent" and a transaction appears in History and on the Dashboard. To start over, click "Cancel and Restart".',
      },
    ],
  },
  {
    slug: 'returning',
    icon: 'i-lucide-log-in',
    title: 'Returning a vehicle',
    summary: 'Receive a lent vehicle back in two steps.',
    sections: [
      {
        heading: 'Step 1: Identify Vehicle',
        body: 'Click "Return" in the sidebar. The list shows every vehicle that is currently lent. Click the vehicle being returned. You can search by name, code or category, or type the Vehicle ID (Code) and click "Fetch Lending Info".',
        image: img('returning-step1', 'Return step 1: identify vehicle'),
        note: 'If no vehicles are lent, the list is empty.',
      },
      {
        heading: 'Step 2: Check Return Details',
        body: 'Confirm the customer, the rental period and the scheduled return time. Inspect the vehicle, then click "Complete Return Process".',
        image: img('returning-step2', 'Return step 2: check return details'),
        bullets: [
          'The vehicle becomes Available again and the transaction is marked Completed.',
          'The actual returned time and the rental duration are recorded in History.',
          'To pick another vehicle, click "Restart".',
        ],
      },
    ],
  },
  {
    slug: 'history',
    icon: 'i-lucide-history',
    title: 'Reading History and exporting',
    summary: 'Review past transactions and download them as CSV.',
    sections: [
      {
        heading: 'Reading the list',
        image: img('history-list', 'Transaction history screen'),
        bullets: [
          'ID: a short transaction ID.',
          'Item: the vehicle name and code.',
          'User: the customer.',
          'Lending Time: when the vehicle was lent.',
          'Returned Time: when it came back. A vehicle still out shows a "Lending" badge and its expected return time.',
          'Duration: how long the rental lasted (shown after return).',
          'Price: the rental price.',
          'The totals at the bottom right show the number of transactions and the total amount for what is currently listed.',
        ],
      },
      {
        heading: 'Searching and filtering',
        bullets: [
          'Type in "Search items or users..." to find a vehicle or customer.',
          'Use "Month" to choose which month to show. It defaults to the current month.',
        ],
      },
      {
        heading: 'Exporting to CSV',
        image: img('history-export', 'Export Transactions dialog'),
        steps: [
          'Click "Export" at the top right.',
          'Choose the Start Date and End Date. They default to the first and last day of the current month. The range is based on the Lending Time.',
          'Click "Download CSV". The file is named transactions_<start>_to_<end>.csv.',
        ],
        note: 'The CSV has the columns ID, Item, User, Lending Time, Returned Time, Duration and Price, and opens correctly in Excel. If no transactions fall in the range, a "No Data" message is shown instead.',
      },
    ],
  },
]

export const howToUseIndex = {
  title: 'How to use',
  summary: 'Staff manual for Rent Flow. Pick a topic below.',
}
