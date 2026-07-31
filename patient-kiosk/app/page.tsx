'use client';
import PatientForm from "./form/patientform"
import PatientPopup from "./popup/patient"
import {useState} from "react"
import { BrowserRouter, Routes, Route, Link, Outlet } from 'react-router-dom';

export default function Home() {
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
  let navClassName = "content-center m-auto";
  let navLinkClassName = "text-center min-w-xs max-w-xs inline-block flex box-container content-center p-15 m-10 rounded-3xl border border-gray-200";
  const roomName = "patient0";
  if(!showNav)
  {
    navClassName += " hidden";
  }
  function onFormDataChange(e)
  {
    connectionData.ws.send(JSON.stringify({type: "room-message", room:"patient0", name: e.target.name, value: e.target.value})); 
    setConnectionData(x =>
    {
      var outgoing = {...x};
      outgoing.formData[e.target.name] = e.target.value;
      return outgoing;
    })
  }
  function CreateWebSocket(isPatient)
  {
    const ws = new WebSocket('ws://localhost:4000/api/register');
    ws.onopen = () => {
      setConnectionData(x=> { return { ...x, ws: ws}});
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
          var outgoing = {...x};
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
            connectionData.formData[keys[key]] = data.form[keys[key]];
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
    CreateWebSocket(true);
  }
  function ClickEmployee()
  {
    CreateWebSocket(false);
  }
  return (
    <BrowserRouter>
      <nav className={navClassName}>
        <Link className={navLinkClassName} to="/patient" onClick={() => { setShowNav(false); ClickPatient();}}>Patients</Link>
        <Link className={navLinkClassName} to="/employee" onClick={() => { setShowNav(false); ClickEmployee();}}>Employees</Link>
      </nav>
      <Routes>
        <Route path="/patient" element={<PatientForm connectionData={connectionData} formState={formState} onChange={onFormDataChange} isPatient={true} />}/>
        <Route path="/employee" element={<PatientForm connectionData={connectionData} formState={formState} isPatient={false} />} />
      </Routes>
    </BrowserRouter>
  );
}

  