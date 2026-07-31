export default function DateField(param:any)
{
    function valueAttribute(v:any)
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
            <label htmlFor={param.name} className="block min-w-[30%] text-black">{param.label}</label>
            <input type="date" name={param.name} id={param.name} {...valueAttribute(param.value)} onChange={e =>
                {
                    if(param.onChange)
                        param.onChange(e);
                }} className="bg-gray-200 text-black"/>
        </div>
    );
}