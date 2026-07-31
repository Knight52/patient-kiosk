"use client";
import PatientForm from "@/app/form/patientform"
import PatientPopup from "@/app/popup/patient"
import {useState} from "react"

export default function Home() {
  return (
    <>
      <PatientForm isPatient={false}></PatientForm>
    </>
  );
}