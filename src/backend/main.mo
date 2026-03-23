import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type Patient = {
    id : Nat;
    name : Text;
    age : Nat;
    gender : Text;
    contact : Text;
    disease : Text;
    treatment : Text;
    admissionDate : Text;
    lastUpdate : Time.Time;
    deleted : Bool;
  };

  module Patient {
    public func compare(p1 : Patient, p2 : Patient) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type Doctor = {
    id : Nat;
    name : Text;
    specialization : Text;
    availability : Bool;
    department : Text;
    patientIds : [Nat];
    lastUpdate : Time.Time;
    deleted : Bool;
  };

  module Doctor {
    public func compare(d1 : Doctor, d2 : Doctor) : Order.Order {
      Nat.compare(d1.id, d2.id);
    };
  };

  type Appointment = {
    id : Nat;
    patientId : Nat;
    doctorId : Nat;
    date : Text;
    time : Text;
    status : Text; // "booked", "completed", "cancelled"
    notes : Text;
    lastUpdate : Time.Time;
    deleted : Bool;
  };

  module Appointment {
    public func compare(a1 : Appointment, a2 : Appointment) : Order.Order {
      Nat.compare(a1.id, a2.id);
    };
  };

  type DashboardTotals = {
    totalPatients : Nat;
    totalDoctors : Nat;
    totalAppointments : Nat;
    todaysAppointments : Nat;
  };

  public type UserProfile = {
    name : Text;
  };

  // Authorization state (kept for compatibility)
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent State
  let patients = Map.empty<Nat, Patient>();
  let doctors = Map.empty<Nat, Doctor>();
  let appointments = Map.empty<Nat, Appointment>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextPatientId = 1;
  var nextDoctorId = 1;
  var nextAppointmentId = 1;

  ///////////////////////////////
  // User Profile Management
  ///////////////////////////////

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    userProfiles.add(caller, profile);
  };

  ///////////////////////////////
  // Patient Management
  ///////////////////////////////

  public shared ({ caller }) func createPatient(patient : Patient) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };

    let newId = nextPatientId;
    nextPatientId += 1;

    let newPatient : Patient = {
      patient with
      id = newId;
      lastUpdate = Time.now();
      deleted = false;
    };

    patients.add(newId, newPatient);
    newId;
  };

  public shared ({ caller }) func readPatient(patientId : Nat) : async Patient {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (patients.get(patientId)) {
      case (null) {
        Runtime.trap("Patient does not exist");
      };
      case (?patient) {
        if (patient.deleted) { Runtime.trap("Patient does not exist") };
        patient;
      };
    };
  };

  public shared ({ caller }) func updatePatient(patient : Patient) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (patients.get(patient.id)) {
      case (null) { Runtime.trap("Patient does not exist") };
      case (?existing) {
        if (existing.deleted) { Runtime.trap("Patient does not exist") };
        let updatedPatient = {
          patient with
          lastUpdate = Time.now();
        };
        patients.add(patient.id, updatedPatient);
      };
    };
  };

  public shared ({ caller }) func deletePatient(patientId : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (patients.get(patientId)) {
      case (null) {
        Runtime.trap("Patient does not exist");
      };
      case (?patient) {
        if (patient.deleted) { Runtime.trap("Patient does not exist") };
        let updatedPatient = {
          patient with
          deleted = true;
        };
        patients.add(patientId, updatedPatient);
      };
    };
  };

  ///////////////////////////////
  // Doctor Management
  ///////////////////////////////

  public shared ({ caller }) func createDoctor(doctor : Doctor) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };

    let newId = nextDoctorId;
    nextDoctorId += 1;

    let newDoctor : Doctor = {
      doctor with
      id = newId;
      patientIds = [];
      lastUpdate = Time.now();
      deleted = false;
    };

    doctors.add(newId, newDoctor);
    newId;
  };

  public shared ({ caller }) func readDoctor(doctorId : Nat) : async Doctor {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (doctors.get(doctorId)) {
      case (null) { Runtime.trap("Doctor does not exist") };
      case (?doctor) {
        if (doctor.deleted) { Runtime.trap("Doctor does not exist") };
        doctor;
      };
    };
  };

  public shared ({ caller }) func updateDoctor(doctor : Doctor) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (doctors.get(doctor.id)) {
      case (null) { Runtime.trap("Doctor does not exist") };
      case (?existing) {
        if (existing.deleted) { Runtime.trap("Doctor does not exist") };
        let updatedDoctor = {
          doctor with
          lastUpdate = Time.now();
        };
        doctors.add(doctor.id, updatedDoctor);
      };
    };
  };

  public shared ({ caller }) func deleteDoctor(doctorId : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    switch (doctors.get(doctorId)) {
      case (null) { Runtime.trap("Doctor does not exist") };
      case (?doctor) {
        if (doctor.deleted) { Runtime.trap("Doctor does not exist") };
        let updatedDoctor = {
          doctor with
          deleted = true;
        };
        doctors.add(doctorId, updatedDoctor);
      };
    };
  };

  ///////////////////////////////
  // Appointment Management
  ///////////////////////////////

  public shared ({ caller }) func createAppointment(appointment : Appointment) : async Nat {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };

    let newId = nextAppointmentId;
    nextAppointmentId += 1;

    let newAppointment : Appointment = {
      appointment with
      id = newId;
      lastUpdate = Time.now();
      deleted = false;
    };

    appointments.add(newId, newAppointment);
    newId;
  };

  public shared ({ caller }) func cancelAppointment(appointmentId : Nat) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };

    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment does not exist") };
      case (?appointment) {
        if (appointment.deleted) { Runtime.trap("Appointment does not exist") };
        let updatedAppointment = {
          appointment with
          status = "cancelled";
          lastUpdate = Time.now();
        };
        appointments.add(appointmentId, updatedAppointment);
      };
    };
  };

  public shared ({ caller }) func rescheduleAppointment(appointmentId : Nat, newDate : Text, newTime : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };

    switch (appointments.get(appointmentId)) {
      case (null) { Runtime.trap("Appointment does not exist") };
      case (?appointment) {
        if (appointment.deleted) { Runtime.trap("Appointment does not exist") };
        let updatedAppointment = {
          appointment with
          date = newDate;
          time = newTime;
          lastUpdate = Time.now();
        };
        appointments.add(appointmentId, updatedAppointment);
      };
    };
  };

  public query ({ caller }) func getAppointmentsByPatient(patientId : Nat) : async [Appointment] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    appointments.values().toArray().filter(func(a) { a.patientId == patientId and not a.deleted });
  };

  public query ({ caller }) func getAppointmentsByDoctor(doctorId : Nat) : async [Appointment] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    appointments.values().toArray().filter(func(a) { a.doctorId == doctorId and not a.deleted });
  };

  ///////////////////////////////
  // Analytics Functions
  ///////////////////////////////

  public query ({ caller }) func getDiseaseFrequency() : async [(Text, Nat)] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    let frequency = Map.empty<Text, Nat>();
    for (p in patients.values()) {
      if (not p.deleted) {
        switch (frequency.get(p.disease)) {
          case (null) { frequency.add(p.disease, 1) };
          case (?count) { frequency.add(p.disease, count + 1) };
        };
      };
    };
    frequency.toArray();
  };

  public query ({ caller }) func getAdmissionsByDate() : async [(Text, Nat)] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    let admissions = Map.empty<Text, Nat>();
    for (p in patients.values()) {
      if (not p.deleted) {
        switch (admissions.get(p.admissionDate)) {
          case (null) { admissions.add(p.admissionDate, 1) };
          case (?count) { admissions.add(p.admissionDate, count + 1) };
        };
      };
    };
    admissions.toArray();
  };

  public query ({ caller }) func getDoctorAppointmentCounts() : async [(Nat, Nat)] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    let counts = Map.empty<Nat, Nat>();
    for (a in appointments.values()) {
      if (not a.deleted) {
        switch (counts.get(a.doctorId)) {
          case (null) { counts.add(a.doctorId, 1) };
          case (?count) { counts.add(a.doctorId, count + 1) };
        };
      };
    };
    counts.toArray();
  };

  public query ({ caller }) func getDashboardTotals(today : Text) : async DashboardTotals {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    let totalPatients = patients.values().toArray().filter(func(p) { not p.deleted }).size();
    let totalDoctors = doctors.values().toArray().filter(func(d) { not d.deleted }).size();
    let totalAppointments = appointments.values().toArray().filter(func(a) { not a.deleted }).size();
    let todaysAppointments = appointments.values().toArray().filter(func(a) { a.date == today and not a.deleted }).size();
    {
      totalPatients;
      totalDoctors;
      totalAppointments;
      todaysAppointments;
    };
  };

  ///////////////////////////////
  // Additional Helper Queries
  ///////////////////////////////

  public query ({ caller }) func getAllPatients() : async [Patient] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    patients.values().toArray().filter(func(p) { not p.deleted }).sort();
  };

  public query ({ caller }) func getAllDoctors() : async [Doctor] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    doctors.values().toArray().filter(func(d) { not d.deleted }).sort();
  };

  public query ({ caller }) func getAllAppointments() : async [Appointment] {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Must be logged in");
    };
    appointments.values().toArray().filter(func(a) { not a.deleted }).sort();
  };
};
