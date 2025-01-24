import React from 'react'
import { Url } from 'url';

type Props = {
    item: any;
};

function ReseauxItem({name,url} : { name: string, url: string  }) {
    return (
        <div className="flex p-2 flex-row place-items-center"> {/* Réseaux items */}
            <div className="basis-3/12">
            <div className="bg-slate-600 rounded-full size-11"></div>
            </div>
            <h2 className="text-xl font-bold basis-6/12 ">{name}</h2>
            <a className="bg-button rounded-2xl p-1 px-2 font-bold text-base" href={url}>Lien</a>
        </div>
    )
}

export default ReseauxItem