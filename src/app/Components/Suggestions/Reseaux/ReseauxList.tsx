import React from 'react'
import ReseauxItem from './ReseauxItem'

function ReseauxList() {
    return (
        <div className="bg-background border border-border_color rounded-xl p-4 m-4">
            <h2 className="text-xl font-bold mb-4">Réseaux</h2>
            <div className="space-y-2">
                <ReseauxItem 
                    name="Linkedin" 
                    url="https://www.linkedin.com/in/amadou-sow-861765212/" 
                />
                <ReseauxItem 
                    name="Github" 
                    url="https://github.com/akumq" 
                />
            </div>
        </div>
    )
}

export default ReseauxList