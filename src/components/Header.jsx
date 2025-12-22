const Header = () => {
  return (
    <div className="text-center py-3 lg:py-6 border-b border-slate-700 lg:border-0 relative flex items-center justify-center">
      <img src="/logom.png" alt="Logo" className="h-6 lg:h-12" />
      <img 
        src="/dogu.jpg" 
        alt="Profile" 
        className="ml-4 w-16 h-16 lg:w-20 lg:h-20 rounded-full animate-spin" 
        style={{animationDuration: '3s'}} 
      />
    </div>
  );
};

export default Header;