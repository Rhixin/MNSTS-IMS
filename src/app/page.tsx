export default function Home() {
  return (
    <main className="min-h-screen bg-primary-cream">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-primary-forest mb-4">
            MNSTS Inventory Management System
          </h1>
          <p className="text-lg text-secondary-gray mb-8">
            Medellin National Science and Technology School
          </p>
          
          <div className="bg-accent-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-primary-forest mb-6">
              Welcome Admin
            </h2>
            
            <div className="space-y-4">
              <button className="w-full bg-primary-forest text-accent-white py-3 px-4 rounded-lg hover:bg-secondary-teal transition-colors duration-200 font-medium">
                Sign In
              </button>
              
              <button className="w-full bg-primary-golden text-primary-forest py-3 px-4 rounded-lg hover:bg-accent-lightGold transition-colors duration-200 font-medium">
                Create Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}