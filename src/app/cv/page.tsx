import React from 'react'
import SideBar from '../Components/Navigations/SideBar'
import Navigations from '../Components/Navigations/Navigations'
import Profile from '../Components/Navigations/Profile'

function CV() {

    return (
        <div className="flex flex-row place-self-center absolute inset-1 w-8/12 h-full">
            <SideBar className="fixed">
                <div className="bg-background basis-1/12"> Logo </div>{/* Logo */}
                <Navigations/>
                <Profile />
            </SideBar>
        </div>
    )
}

export default CV