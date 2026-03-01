import React from 'react'

const NotFoundPage = () => {
  return (
    <div className='flex flex-col items-center py-50 min-h-screen'>
          <h1 className='text-3xl font-bold text-neutral-600 dark:text-neutral-300'>404 Not Found</h1>
          <p className='text-neutral-500 dark:text-neutral-400 text-center px-2'>The page you are looking for is unavailable.</p>
    </div>
  )
}

export default NotFoundPage