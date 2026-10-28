// Initial demo data for Stockwise Smart Inventory Management System
// Structured for future integration with Java Spring Boot REST APIs and MySQL

export const initialCategories = [
  { id: 'cat-1', name: 'Smart Electronics', code: 'ELEC', description: 'Sensors, microcontrollers, smart gateways and modules', productCount: 4 },
  { id: 'cat-2', name: 'Industrial Hardware', code: 'HDW', description: 'Mounts, brackets, enclosures, and structural parts', productCount: 3 },
  { id: 'cat-3', name: 'Networking & Cables', code: 'NET', description: 'High-speed ethernet, fiber patch cords and connectors', productCount: 3 },
  { id: 'cat-4', name: 'Packaging & Logistics', code: 'LOG', description: 'Heavy duty boxes, pallets, RFID labels and tape', productCount: 2 },
  { id: 'cat-5', name: 'Safety Equipment', code: 'SAF', description: 'Helmets, ESD gloves, protective goggles, and vests', productCount: 2 }
];

export const initialSuppliers = [
  {
    id: 'sup-1',
    name: 'Apex Micro Technologies',
    contactPerson: 'David Chen',
    email: 'd.chen@apexmicro.com',
    phone: '+1 (555) 234-8901',
    category: 'Smart Electronics',
    leadTimeDays: 5,
    status: 'Active',
    address: 'San Jose, CA'
  },
  {
    id: 'sup-2',
    name: 'Vanguard Industrial Supply',
    contactPerson: 'Elena Rostova',
    email: 'elena@vanguardind.com',
    phone: '+1 (555) 987-6543',
    category: 'Industrial Hardware',
    leadTimeDays: 7,
    status: 'Active',
    address: 'Chicago, IL'
  },
  {
    id: 'sup-3',
    name: 'Global Fiber & Network Co.',
    contactPerson: 'Marcus Vance',
    email: 'm.vance@globalfiber.net',
    phone: '+1 (555) 456-7890',
    category: 'Networking & Cables',
    leadTimeDays: 3,
    status: 'Active',
    address: 'Austin, TX'
  },
  {
    id: 'sup-4',
    name: 'EcoPack Logistics Depot',
    contactPerson: 'Sarah Jenkins',
    email: 'sarah@ecopackdepot.com',
    phone: '+1 (555) 321-7654',
    category: 'Packaging & Logistics',
    leadTimeDays: 2,
    status: 'Active',
    address: 'Seattle, WA'
  }
];

export const initialCustomers = [
  {
    id: 'cust-1',
    name: 'OmniCorp Solutions',
    contactPerson: 'Rachel Adams',
    email: 'rachel@omnicorp.io',
    phone: '+1 (555) 111-2233',
    totalOrders: 18,
    totalSpent: 42850,
    status: 'Active',
    address: 'New York, NY'
  },
  {
    id: 'cust-2',
    name: 'HyperScale Data Labs',
    contactPerson: 'Tom Sterling',
    email: 'tsterling@hyperscale.org',
    phone: '+1 (555) 333-4455',
    totalOrders: 12,
    totalSpent: 31200,
    status: 'Active',
    address: 'Boston, MA'
  },
  {
    id: 'cust-3',
    name: 'Nexis Robotic Systems',
    contactPerson: 'Kavita Patel',
    email: 'kavita@nexisrobotics.com',
    phone: '+1 (555) 555-6677',
    totalOrders: 9,
    totalSpent: 19450,
    status: 'Active',
    address: 'Denver, CO'
  },
  {
    id: 'cust-4',
    name: 'Zenith Logistics Hub',
    contactPerson: 'Bradley Cooper',
    email: 'bcooper@zenithhub.com',
    phone: '+1 (555) 777-8899',
    totalOrders: 5,
    totalSpent: 8750,
    status: 'Active',
    address: 'Atlanta, GA'
  }
];

export const initialProducts = [
  {
    id: 'prod-1',
    name: 'Industrial IoT Gateway Pro X5',
    sku: 'STK-ELEC-001',
    category: 'Smart Electronics',
    price: 349.99,
    cost: 210.00,
    quantity: 42,
    reorderLevel: 15,
    supplier: 'Apex Micro Technologies',
    status: 'In Stock',
    location: 'Aisle 3, Rack B-12'
  },
  {
    id: 'prod-2',
    name: 'Smart Environmental Sensor Node',
    sku: 'STK-ELEC-002',
    category: 'Smart Electronics',
    price: 89.50,
    cost: 45.00,
    quantity: 6,
    reorderLevel: 20,
    supplier: 'Apex Micro Technologies',
    status: 'Low Stock',
    location: 'Aisle 2, Rack A-04'
  },
  {
    id: 'prod-3',
    name: 'Heavy Duty Structural Steel Bracket',
    sku: 'STK-HDW-104',
    category: 'Industrial Hardware',
    price: 24.00,
    cost: 11.50,
    quantity: 180,
    reorderLevel: 50,
    supplier: 'Vanguard Industrial Supply',
    status: 'In Stock',
    location: 'Aisle 5, Rack D-01'
  },
  {
    id: 'prod-4',
    name: 'Armored Cat6A Shielded Cable 500m',
    sku: 'STK-NET-201',
    category: 'Networking & Cables',
    price: 215.00,
    cost: 130.00,
    quantity: 0,
    reorderLevel: 10,
    supplier: 'Global Fiber & Network Co.',
    status: 'Out of Stock',
    location: 'Aisle 4, Rack C-09'
  },
  {
    id: 'prod-5',
    name: 'Precision Laser Barcode Scanner 2D',
    sku: 'STK-ELEC-003',
    category: 'Smart Electronics',
    price: 175.00,
    cost: 95.00,
    quantity: 8,
    reorderLevel: 12,
    supplier: 'Apex Micro Technologies',
    status: 'Low Stock',
    location: 'Aisle 1, Rack A-02'
  },
  {
    id: 'prod-6',
    name: 'Industrial Pallet Wrap Film 20um',
    sku: 'STK-LOG-301',
    category: 'Packaging & Logistics',
    price: 32.50,
    cost: 16.00,
    quantity: 95,
    reorderLevel: 30,
    supplier: 'EcoPack Logistics Depot',
    status: 'In Stock',
    location: 'Aisle 6, Rack E-15'
  },
  {
    id: 'prod-7',
    name: 'RFID Asset Tracking Tags (Roll of 1000)',
    sku: 'STK-LOG-302',
    category: 'Packaging & Logistics',
    price: 145.00,
    cost: 72.00,
    quantity: 34,
    reorderLevel: 15,
    supplier: 'EcoPack Logistics Depot',
    status: 'In Stock',
    location: 'Aisle 6, Rack E-03'
  },
  {
    id: 'prod-8',
    name: 'High-Temperature Sensor Probe K-Type',
    sku: 'STK-ELEC-004',
    category: 'Smart Electronics',
    price: 58.00,
    cost: 28.00,
    quantity: 3,
    reorderLevel: 15,
    supplier: 'Apex Micro Technologies',
    status: 'Low Stock',
    location: 'Aisle 2, Rack B-06'
  },
  {
    id: 'prod-9',
    name: 'Multi-Gigabit Industrial Switch 8-Port',
    sku: 'STK-NET-202',
    category: 'Networking & Cables',
    price: 490.00,
    cost: 295.00,
    quantity: 19,
    reorderLevel: 8,
    status: 'In Stock',
    supplier: 'Global Fiber & Network Co.',
    location: 'Aisle 4, Rack C-02'
  },
  {
    id: 'prod-10',
    name: 'Anti-Static ESD Safety Shoes (Size 10)',
    sku: 'STK-SAF-401',
    category: 'Safety Equipment',
    price: 85.00,
    cost: 48.00,
    quantity: 28,
    reorderLevel: 10,
    supplier: 'Vanguard Industrial Supply',
    status: 'In Stock',
    location: 'Aisle 7, Rack F-05'
  }
];

export const initialPurchaseOrders = [
  {
    id: 'PO-2026-089',
    supplier: 'Apex Micro Technologies',
    itemsCount: 3,
    totalAmount: 4320.00,
    status: 'Completed',
    orderDate: '2026-10-10',
    expectedDelivery: '2026-10-15'
  },
  {
    id: 'PO-2026-090',
    supplier: 'Global Fiber & Network Co.',
    itemsCount: 1,
    totalAmount: 1850.00,
    status: 'In Transit',
    orderDate: '2026-10-12',
    expectedDelivery: '2026-10-17'
  },
  {
    id: 'PO-2026-091',
    supplier: 'EcoPack Logistics Depot',
    itemsCount: 4,
    totalAmount: 2640.00,
    status: 'Pending',
    orderDate: '2026-10-14',
    expectedDelivery: '2026-10-19'
  },
  {
    id: 'PO-2026-092',
    supplier: 'Apex Micro Technologies',
    itemsCount: 2,
    totalAmount: 3150.00,
    status: 'Processing',
    orderDate: '2026-10-15',
    expectedDelivery: '2026-10-21'
  }
];

export const initialSales = [
  {
    id: 'INV-2026-1042',
    customer: 'OmniCorp Solutions',
    product: 'Industrial IoT Gateway Pro X5',
    quantity: 6,
    totalAmount: 2099.94,
    date: '2026-10-15',
    status: 'Paid',
    paymentMethod: 'Wire Transfer'
  },
  {
    id: 'INV-2026-1041',
    customer: 'HyperScale Data Labs',
    product: 'Multi-Gigabit Industrial Switch 8-Port',
    quantity: 2,
    totalAmount: 980.00,
    date: '2026-10-15',
    status: 'Paid',
    paymentMethod: 'Corporate Credit'
  },
  {
    id: 'INV-2026-1040',
    customer: 'Nexis Robotic Systems',
    product: 'Heavy Duty Structural Steel Bracket',
    quantity: 40,
    totalAmount: 960.00,
    date: '2026-10-14',
    status: 'Paid',
    paymentMethod: 'Net 30'
  },
  {
    id: 'INV-2026-1039',
    customer: 'Zenith Logistics Hub',
    product: 'RFID Asset Tracking Tags (Roll of 1000)',
    quantity: 5,
    totalAmount: 725.00,
    date: '2026-10-13',
    status: 'Pending',
    paymentMethod: 'Net 30'
  },
  {
    id: 'INV-2026-1038',
    customer: 'OmniCorp Solutions',
    product: 'Precision Laser Barcode Scanner 2D',
    quantity: 4,
    totalAmount: 700.00,
    date: '2026-10-12',
    status: 'Paid',
    paymentMethod: 'Wire Transfer'
  }
];

export const initialNotifications = [
  {
    id: 'notif-1',
    type: 'out_of_stock',
    title: 'Product Out of Stock',
    message: 'Armored Cat6A Shielded Cable 500m (STK-NET-201) reached 0 units.',
    timestamp: '15 mins ago',
    read: false,
    urgent: true
  },
  {
    id: 'notif-2',
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Smart Environmental Sensor Node has only 6 units remaining (Reorder level: 20).',
    timestamp: '1 hour ago',
    read: false,
    urgent: true
  },
  {
    id: 'notif-3',
    type: 'po_update',
    title: 'Purchase Order In Transit',
    message: 'PO-2026-090 from Global Fiber is scheduled for arrival tomorrow.',
    timestamp: '3 hours ago',
    read: true,
    urgent: false
  },
  {
    id: 'notif-4',
    type: 'sale',
    title: 'New High-Value Sale',
    message: 'OmniCorp Solutions placed an order of $2,099.94 for 6x IoT Gateways.',
    timestamp: '5 hours ago',
    read: true,
    urgent: false
  }
];

export const initialSettings = {
  businessName: 'Stockwise Logistics & Inventory Ltd.',
  companyEmail: 'operations@stockwise.io',
  currency: 'USD',
  currencySymbol: '$',
  lowStockThreshold: 15,
  warehouseLocation: 'Main Depot - Bay Area, Warehouse #4',
  enableEmailAlerts: true,
  autoReorderSuggestions: true,
  fiscalYearStart: 'January'
};

// Realistic Chart Data for Last 7 Days, Last 30 Days, This Year
export const chartDataRanges = {
  '7days': [
    { name: 'Sat', sales: 3200, revenue: 4100, orders: 12 },
    { name: 'Sun', sales: 1800, revenue: 2300, orders: 7 },
    { name: 'Mon', sales: 4500, revenue: 5800, orders: 19 },
    { name: 'Tue', sales: 5200, revenue: 6400, orders: 22 },
    { name: 'Wed', sales: 4800, revenue: 5900, orders: 18 },
    { name: 'Thu', sales: 6100, revenue: 7600, orders: 26 },
    { name: 'Fri', sales: 5464, revenue: 6980, orders: 24 }
  ],
  '30days': [
    { name: 'Week 1', sales: 24500, revenue: 31200, orders: 98 },
    { name: 'Week 2', sales: 28900, revenue: 36400, orders: 114 },
    { name: 'Week 3', sales: 26400, revenue: 33800, orders: 105 },
    { name: 'Week 4', sales: 32100, revenue: 40900, orders: 132 }
  ],
  'year': [
    { name: 'Jan', sales: 78000, revenue: 98000, orders: 310 },
    { name: 'Feb', sales: 82000, revenue: 104000, orders: 330 },
    { name: 'Mar', sales: 94000, revenue: 119000, orders: 380 },
    { name: 'Apr', sales: 88000, revenue: 112000, orders: 350 },
    { name: 'May', sales: 102000, revenue: 129000, orders: 410 },
    { name: 'Jun', sales: 115000, revenue: 145000, orders: 460 },
    { name: 'Jul', sales: 108000, revenue: 138000, orders: 430 },
    { name: 'Aug', sales: 124000, revenue: 156000, orders: 495 },
    { name: 'Sep', sales: 118000, revenue: 149000, orders: 470 },
    { name: 'Oct', sales: 132000, revenue: 167000, orders: 525 }
  ]
};

export const categoryBreakdownData = [
  { name: 'Smart Electronics', value: 48500, color: '#173D32' },
  { name: 'Industrial Hardware', value: 24800, color: '#214D39' },
  { name: 'Networking & Cables', value: 18900, color: '#2E694D' },
  { name: 'Packaging & Logistics', value: 12400, color: '#5B8C70' },
  { name: 'Safety Equipment', value: 8700, color: '#97BAA6' }
];
