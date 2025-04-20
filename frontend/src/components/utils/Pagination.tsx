
const Pagination = ({ currentPage, totalPages, setPageNo }:{currentPage:number, totalPages:number, setPageNo:React.Dispatch<React.SetStateAction<number>>}) => {
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++){
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        endPage = 4;
      }
      
      if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
      }
      
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  return (
    <div className="rounded-lg flex flex-col items-center p-4">
      <nav className="flex justify-center w-full">
        <ul className="flex space-x-1">
          {/* Previous button */}
          <li>
            <button
              className={`flex items-center justify-center h-10 w-10 rounded-md 
                ${currentPage === 1 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'} 
                bg-gray-800 transition-colors duration-150`}
              aria-label="Previous page"
              onClick={()=>{setPageNo(prev => prev===0 ? 0 : prev-1)}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </li>
          
          {/* Page numbers */}
          {getPageNumbers().map((page, index) => (
            <li key={index}>
              {page === '...' ? (
                <span className="flex items-center justify-center h-10 w-10 text-gray-400">
                  ...
                </span>
              ) : (
                <button
                  className={`flex items-center justify-center h-10 w-10 rounded-md transition-colors duration-150 
                    ${currentPage === page 
                      ? 'bg-teal-600/50 text-white' 
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </li>
          ))}
          
          {/* Next button */}
          <li>
            <button
              className={`flex items-center justify-center h-10 w-10 rounded-md 
                ${currentPage === totalPages 
                  ? 'text-gray-500 cursor-not-allowed' 
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'} 
                bg-gray-800 transition-colors duration-150`}
              aria-label="Next page"
              onClick={()=>{setPageNo(prev => prev===totalPages-1 ? prev : prev+1)}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;