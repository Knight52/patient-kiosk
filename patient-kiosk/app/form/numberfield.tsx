import {useState} from 'react';

let validateFunction = null;
export default function NumberField({label, name, value, onValidate, onChange})
{
    validateFunction = onValidate;
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
    function valueAttribute(v)
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
            <label htmlFor={name} className="inline-block min-w-[30%] text-black">{label}</label>
            <div>
                <input name={name} id={name} {...valueAttribute(value)} className={textboxClassName} type="text" pattern="[0-9]*"
                onChange={(e) => {
                    if(onValidate)
                        setValid(onValidate(e.target.value) && !isNaN(e.target.value)); 
                    else
                        setValid(!isNaN(e.target.value));
                    if(onChange)
                        onChange(e);
                }}/>
                <p className={invalidTextClassName}>Required *</p>
            </div>
        </div>
    );
}