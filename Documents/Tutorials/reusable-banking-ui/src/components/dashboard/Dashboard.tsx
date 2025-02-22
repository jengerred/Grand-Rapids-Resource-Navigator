import { mockUser, mockTransactions } from "@/utils/mockData";

export default function Dashboard() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Welcome, {mockUser.name}
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-gray-500 text-sm mb-2">Available Balance</h2>
          <p className="text-3xl font-bold">$1,234.56</p>
        </div>

        {/* Transactions Preview */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
          <div className="space-y-3">
            {mockTransactions.map(transaction => (
              <div key={transaction.id} className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.date}</p>
                </div>
                <span className={`text-lg ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(transaction.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
