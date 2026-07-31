'use client';
import PatientForm from "./form/patientform"
import {useState} from "react"
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';
import {createClient} from '@supabase/supabase-js'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
export default function Home() {
  const [pageState, setPageState] = useState(0);
  const [formState, setFormState] = useState("input");
  const [showNav, setShowNav] = useState(true);
  const [connectionData, setConnectionData] = useState({
    id: "-",
    ws: null,
    formData:{
      firstName: "",
      middleName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "Male",
      phoneNumber: "",
      email: "",
      address: "",
      language: "",
      nationality: "",
      religion: "",
      emergencyContactName: "",
      emergencyContactRelationShip: ""
    }
  });
  let page = (<></>);
  let idList = (<></>);
  let navClassName = "content-center m-auto";
  let navLinkClassName = "text-center min-w-xs max-w-xs inline-block flex box-container content-center p-15 m-10 rounded-3xl border border-gray-200";
  const roomName = "patient0";
  let timeout:ReturnType<typeof setTimeout>;
  switch(pageState)
  {
    case 0: page = (<div className={navClassName}>
      <a className={navLinkClassName} href="#" onClick={(e:any)=>{ ClickPatient();}}>Patient</a>
      <a className={navLinkClassName} href="#" onClick={(e:any)=>{ ClickStaff();}}>Staff</a>
    </div>); break;
    case 1: page = (
        <>
          <PatientForm connectionData={connectionData} formState={formState} onChange={onFormDataChange} isPatient={true} />
        </>
      );
      break;
    case 2: page = (
      <>
        <div className="fixed text-black">
            <p>State: {formState}</p>
            <p>Tracking Form ID {connectionData.id}</p>
        </div>
        <PatientForm connectionData={connectionData} formState={formState} isPatient={false} />
      </>);break;
  }
  if(!showNav)
  {
    navClassName += " hidden";
  }
  async function onFormDataChange(e:any)
  {
    //if(connectionData.ws)
      //(connectionData.ws as WebSocket).send(JSON.stringify({type: "room-message", room:"patient0", name: e.target.name, value: e.target.value})); 
    let toUpdate = {};
    toUpdate[e.target.name] = e.target.value;
    const {error} = await supabase.from('form').update(toUpdate).eq("id", connectionData.id);
    
    setConnectionData(x =>
    {
      var outgoing = {...x};
      (outgoing.formData as any)[e.target.name] = e.target.value;
      return outgoing;
    })
    if(timeout)
    {
        clearInterval(timeout);
    }
    timeout = setTimeout(()=>{
        if(formState == "input")
        {
          let toUpdate = {formState: "idle"};
          supabase.from('form').update(toUpdate).eq("id", connectionData.id);
        }
    }, 3000);
  }
  async function ClickPatient()
  {
    const {data, error} = await supabase.from('form').insert({...connectionData.formData, formState: "input"}).select().single();
    setPageState(1);
    setConnectionData(x =>{
      return {...connectionData, id: data.id };
    });
  }
  async function ClickStaff()
  {
    const { data, error } = await supabase.from('form').select().order("id", {ascending: false}).limit(1).single();
    console.log(data);
    setConnectionData(x =>{
      return {...x, id: data.id, formData: data };
    });
    const channel = supabase.channel('form_changes')
      .on('postgres_changes', {event: 'UPDATE', schema: 'public', table: 'form', filter: 'id=eq.' + data.id}, 
      (payload:any) => 
      {
        setConnectionData(x =>{
          return {...connectionData, formData: payload.new };
        });
        setFormState(payload.new.formState);
      })
      .subscribe();
    setPageState(2);
  }
  return (
    <>
    {page}
    </>
  );
}