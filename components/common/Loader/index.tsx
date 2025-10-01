// const Loader = () => {
//   return (
//     <div className="flex  items-center justify-center dark:bg-black">
//       <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
//     </div>
//   );
// };

// export default Loader;



const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 dark:bg-black dark:bg-opacity-75 z-50">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
    </div>
  );
};

export default Loader;
