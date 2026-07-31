import {useState} from 'react';

export default function TextField(param:any)
{
    const [valid,setValid] = useState(true);
    let textboxClassName = "bg-gray-200 text-black";
    let invalidTextClassName = "text-red-600 text-xs";
    if(valid)
    {
        invalidTextClassName += " hidden";
    }
    else
    {
        textboxClassName += " border border-red-600";
    }
    function valueAttribute(v:string)
    {
        if(v != undefined && v != null)
        {
            return { value: v};
        }
        else
        {
            return {};
        }
    }
    return (
        <div className="box-content">
            <label htmlFor={param.name} className="inline-block min-w-[30%] text-black">{param.label}</label>
            <div>
                <input name={param.name} id={param.name} {...valueAttribute(param.value)} className={textboxClassName} onChange={(e) => {
                    if(param.onValidate)
                        setValid(param.onValidate(e.target.value)); 
                    if(param.onChange)
                        param.onChange(e);
                }}/>
                <p className={invalidTextClassName}>Required *</p>
            </div>
        </div>
    );
}