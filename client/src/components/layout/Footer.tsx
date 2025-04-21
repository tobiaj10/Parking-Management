export default function Footer() {
  return (
    <footer className="bg-[#212121] text-white py-3 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <p className="text-sm">© {new Date().getFullYear()} ParkSmart Garage System</p>
        <div className="flex items-center space-x-4">
          <button className="text-sm flex items-center hover:underline">
            <span className="material-icons text-sm mr-1" style={{ fontFamily: 'Material Icons' }}>settings</span>
            Settings
          </button>
          <button className="text-sm flex items-center hover:underline">
            <span className="material-icons text-sm mr-1" style={{ fontFamily: 'Material Icons' }}>help</span>
            Help
          </button>
        </div>
      </div>
    </footer>
  );
}
