import React from 'react'
import prisma from '@/lib/prisma';

async function ThreadItem({id} : {id: number}) {

    const thread = await prisma.thread.findUnique({
        where: {
            id: id
        }
    })

  return (
    <div className=' border border-border_color pb-3 snap-proximity '>
        <div className="flex flex-row">
            <div className="bg-slate-600 rounded-full size-11 m-3"></div>
            <h3 className="text-xl self-center ">user</h3>
            <h3 className="text-xl text-text_highlight opacity-50 m-0 self-center "> @user</h3>
        </div>
        <div className='m-3'>
           {thread?.content}
        </div>
        {thread?.imageUrl && (
            <div className="w-full">
                <img className="m-auto w-auto  self-center object-cover  rounded-lg" src={thread.imageUrl} alt="image description" />
            </div>
        )}
        <div className="flex flex-row h-auto w-full mx-6 my-2 flex-auto">
            <div className= "flex w-auto flex-row flex-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 self-center stroke-border_color">
                    <path d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
                </svg>
                <p className="opacity-50 text-xs self-center">9</p>
            </div>

            <div className= "flex w-auto  flex-row flex-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 self-center stroke-border_color">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                </svg>
                <p className="opacity-50 text-xs self-center ">28</p>
            </div>

            <div className= "flex flex-row flex-auto grow ">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 self-center stroke-border_color">
                    <path d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                </svg>

                <p className="opacity-50 text-xs self-center">18</p>
            </div>
            
            <div className= "flex w-auto flex-row flex-auto">   
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-5 self-center stroke-border_color">
                    <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>

                <p className="opacity-50 text-xs self-center">2K</p>
            </div>     
        </div>
    </div>
  )
}

export default ThreadItem