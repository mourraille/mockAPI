import React from "react";

const Footer = () => {
  return (
    <footer className='bg-gray-100 dark:bg-gray-900 text-center py-4'>
      <a
        href='https://mourraille.com'
        className='text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 inline-block w-full h-full py-2'
        target='_blank'
        rel='noopener noreferrer'
      >
        © Mourraille {new Date().getFullYear()}
      </a>
    </footer>
  );
};

export default Footer;
