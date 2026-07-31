import Image from "next/image";
import Form from "next/form";
import TextField from "@/app/form/textfield";
import NumberField from "@/app/form/numberfield";
import DateField from "@/app/form/datefield";
import {useState} from "react"
export default function PatientForm({isPatient, connectionData, onChange, formState})
{
    let headerText = "Patient Information KIOSK"; 
    let value = {};
    let submitButton = (<></>);
    let formStatus = (<></>);
    let timeout = null;
    const [submitted, setSubmitted] = useState(false);
    if(!isPatient)
    {
        headerText = "Tracking Patient Information";
        formStatus = (
            <>
                <div className="fixed text-black">
                    <p>State: {formState}</p>
                </div>
            </>
        );
    }
    else
    {
        if(!submitted)
        {
            submitButton = (
                <>
                    <br/>
                    <a
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-green-600 px-5 text-white transition-colors hover:bg-green-400 md:w-[158px]"
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={submit}
                    >
                        Submit
                    </a>
                </>);
        }
        else
        {
            submitButton = (
                <>
                    <br/>
                    <p className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gray-600 px-5 text-white transition-colors md:w-[158px]">
                        Submitted
                    </p>
                </>);
        }
    }
    function onFieldChange(e)
    {
        if(onChange)
            onChange(e);
        if(timeout != null)
        {
            clearInterval(interval);
        }
        interval = setTimeout(()=>{
            if(formState == "input")
                connectionData.ws.send(JSON.stringify({type:"room-message", room: "patient0", state: "idle"}));
        }, 3000);
        if(formState == "idle")
        {
            connectionData.ws.send(JSON.stringify({type:"room-message", room: "patient0", state: "input"}));
        }
    }
    function getInputValueAttribute(v)
    {
        if(isPatient) return {};
        else return {value: v};
    }
    function submit(e)
    {
        e.preventDefault();
        console.log(connectionData);
        let formData = connectionData.formData;
        let missing = [];
        if(!formData.firstName) missing.push("First Name");
        if(!formData.lastName) missing.push("Last Name");
        if(!formData.dateOfBirth) missing.push("Date of Birth");
        if(!formData.gender) missing.push("Gender");
        if(!formData.phoneNumber) missing.push("Phone Number");
        if(!formData.email) missing.push("Email");
        if(!formData.address) missing.push("Address");
        if(!formData.language) missing.push("Preferred Language");
        if(!formData.nationality) missing.push("Nationality");

        if(missing.length > 0)
        {
            alert("Missing information: " + missing.join(", "));
            return;
        }

        if(!formData.email.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g))
        {
            alert("Invalid Email");
            return;
        }
        if(isNaN(formData.phoneNumber) || formData.phoneNumber.indexOf("e") >= 0)
        {
            alert("Invalid Phone Number");
            return;
        }
        
        connectionData.ws.send(JSON.stringify({type:"room-message", room: "patient0", state: "submitted"}));
        setSubmitted(true);
        alert("Form Submitted");
    }
    return (
        <>
        {formStatus}
        <div className="flex flex-col flex-1 items-center justify-center bg-gray-100 font-sans">
            <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-gray-100 sm:items-start">
                <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left w-[100%]">
                <h1 className="text-3xl font-semibold leading-10 tracking-tight text-black">
                    {headerText}
                </h1>
                <Form action="/submit" className="w-full">
                    <fieldset disabled={!isPatient || submitted}>
                        <h2 className="text-2xl font-semibold leading-10 tracking-tight text-black">Personal Information</h2>
                        <TextField label="First Name" name="firstName" onChange={onFieldChange} onValidate={(text) => text} {...getInputValueAttribute(connectionData.formData.firstName)}></TextField>
                        <TextField label="Middle Name" name="middleName" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.middleName)}></TextField>
                        <TextField label="Last Name" name="lastName" onChange={onFieldChange} onValidate={(text) => text} {...getInputValueAttribute(connectionData.formData.lastName)}></TextField>
                        <DateField label="Date of Birth" name="dateOfBirth" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.dateOfBirth)}></DateField>
                        <div className="box-content h-8">
                        <label htmlFor="gender" className="inline-block min-w-[30%] text-black">Gender</label>
                        <select name="gender" className="text-black" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.gender)}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
                        </div>
                        <NumberField label="Phone Number" name="phoneNumber" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.phoneNumber)}/>
                        <TextField label="Email" name="email" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.email)} onValidate={(text)=>{
                            return text.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g);
                        }}/>
                        <TextField label="Address" name="address" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.address)} onValidate={(text) => text}/>
                        <TextField label="Preferred Language" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.language)} name="language"/>
                        <TextField label="Nationality" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.nationality)} name="nationality"/>
                        <TextField label="Religion" onChange={onFieldChange} {...getInputValueAttribute(connectionData.formData.religion)} name="religion"/>
                        <br/>
                        <h2 className="text-2xl font-semibold leading-10 tracking-tight text-black">Emergency Contact</h2>
                        <TextField label="Name" name="emergencyContactName" {...getInputValueAttribute(connectionData.formData.emergencyContactName)} onChange={onFieldChange}/>
                        <TextField label="Relationship" name="emergencyContactRelationship" {...getInputValueAttribute(connectionData.formData.emergencyContactRelationship)} onChange={onFieldChange}/>
                    </fieldset>
                    {submitButton}
                </Form>
                </div>
            </main>
        </div>
        </>
    );
}