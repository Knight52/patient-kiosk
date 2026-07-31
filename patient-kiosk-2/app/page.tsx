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
  console.log(process);
  console.log(process.env);
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
  let navClassName = "content-center m-auto";
  let navLinkClassName = "text-center min-w-xs max-w-xs inline-block flex box-container content-center p-15 m-10 rounded-3xl border border-gray-200";
  const roomName = "patient0";
  switch(pageState)
  {
    case 0: page = (<div className={navClassName}>
      <a className={navLinkClassName} href="#" onClick={(e:any)=>{ ClickPatient();}}>Patient</a>
      <a className={navLinkClassName} href="#" onClick={(e:any)=>{ ClickEmployee();}}>Staff</a>
    </div>); break;
    case 1: page = (<PatientForm connectionData={connectionData} formState={formState} onChange={onFormDataChange} isPatient={true} />);break;
    case 2: page = (<PatientForm connectionData={connectionData} formState={formState} isPatient={false} />);break;
  }
  if(!showNav)
  {
    navClassName += " hidden";
  }
  function onFormDataChange(e:any)
  {
    if(connectionData.ws)
      (connectionData.ws as WebSocket).send(JSON.stringify({type: "room-message", room:"patient0", name: e.target.name, value: e.target.value})); 
    
    setConnectionData(x =>
    {
      var outgoing = {...x};
      (outgoing.formData as any)[e.target.name] = e.target.value;
      return outgoing;
    })
  }
  function CreateWebSocket(isPatient:boolean)
  {
    const ws = new WebSocket('ws://localhost:4000/api/register');
    ws.onopen = () => {
      setConnectionData((x:any)=> { return { ...x, ws: ws}});
      console.log('Connected to WebSocket');
      if(isPatient)
      {
        ws.send(JSON.stringify({type:"join-room", room: roomName, state: "setup"}));
      }
      else
      {
        ws.send(JSON.stringify({type:"join-room", room: roomName}));
      }
    };
    ws.onmessage = (event) => {
      console.log('Message received:', event.data);
      let data = JSON.parse(event.data);
      if(data.id)
      {
        setConnectionData(x => { return { ...x, id: data.id}});
      }

      if(data.name && (data.value || data.value == "") && !isPatient)
      {
        setConnectionData(x => {
          var outgoing:any = {...x};
          outgoing.formData[data.name] = data.value;
          return outgoing;
        })
      }
      if(data.state)
      {
        if(data.state == "setup")
        {
          setFormState("input");
          if(!isPatient)
          {
            setConnectionData(x =>
            {
              return {... x,
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
              }
            });
          }
        }
        else
        {
          setFormState(data.state);
        }
      }
      if(!isPatient && data.form)
      {
        setConnectionData(x =>
        {
          var outgoing = {...x};
          let keys = Object.keys(data.form);
          for(let key in keys)
          {
            (connectionData as any).formData[keys[key]] = data.form[keys[key]];
          }
          return outgoing;
        });
      }
    };
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
  }
  function ClickPatient()
  {
    setPageState(1);
    CreateWebSocket(true);
  }
  function ClickEmployee()
  {
    setPageState(2);
    CreateWebSocket(false);
  }
  return (
    <>
    {page}
    </>
  );
}

  