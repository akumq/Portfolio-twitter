import React from 'react'

function Profile() {
  return (
    <div className=" basis-2/12"> 
      <div className="rounded-full flex flex-row hover:bg-slate-600/10">
        <div className="bg-slate-600 rounded-full size-11 m-5"></div>
        <div className="flex flex-col self-center">
        <h2 className="text-xl pb-2 font-bold ">Pseudo</h2>
          <p>Junior Développeur</p>
        </div>
      </div>
    </div>

  )
}

export default Profile