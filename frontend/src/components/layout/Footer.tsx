export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start space-x-6 md:order-2">
            <p className="text-gray-400 text-sm">
              <span className="font-semibold text-primary-600">125 kg</span> de CO2 économisés par la communauté !
            </p>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PartageVoisins. Developed by Youssef FATIMI & Tarik AFTYS.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
