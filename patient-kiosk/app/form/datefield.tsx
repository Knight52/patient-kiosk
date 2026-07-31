export default function DateField({label, value, name, onChange})
{
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
            <label htmlFor={name} className="block min-w-[30%] text-black">{label}</label>
            <input type="date" name={name} id={name} {...valueAttribute(value)} onChange={e =>
                {
                    if(onChange)
                        onChange(e);
                }} className="bg-gray-200 text-black"/>
        </div>
    );
}