interface HeaderProps {
  currentTime: string;
}

export default function Header({ currentTime }: HeaderProps) {
  return (
    <header className="bg-[#1976D2] text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="material-icons text-3xl mr-3" style={{ fontFamily: 'Material Icons' }}>local_parking</span>
          <h1 className="text-2xl font-semibold">ParkSmart Garage System</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm">{currentTime}</span>
          <div className="flex items-center">
            <span className="material-icons mr-1" style={{ fontFamily: 'Material Icons' }}>person</span>
            <span>Attendant</span>
          </div>
        </div>
      </div>
    </header>
  );
}
