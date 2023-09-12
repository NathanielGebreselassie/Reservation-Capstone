import React, { useEffect, useState } from "react";
import { listReservations, listTables, finishTable, cancelReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import { next, previous, today } from "../utils/date-time";
import Reservation from "../layout/Reservation/Reservation";
import Table from "../layout/Table/Table";
import "../layout/Layout.css";

function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationDate, setReservationDate] = useState(date);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(loadDashboard, [reservationDate]);

  function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);

    listReservations({ date: reservationDate }, abortController.signal)
      .then(setReservations)
      .catch(setReservationsError);

    listTables().then(setTables);

    return () => abortController.abort();
  }

  function onFinish(table_id, reservation_id) {
    finishTable(table_id, reservation_id)
      .then(loadDashboard);
  }

  function onCancel(reservation_id) {
    const abortController = new AbortController();

    cancelReservation(reservation_id, abortController.signal)
      .then(loadDashboard);

    return () => abortController.abort();
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <div className="d-md-flex mb-3">
        <button
          type="button"
          onClick={() => {
            setReservationDate(previous(reservationDate));
          }}
          className="btn btn-secondary custom-btn"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => {
            setReservationDate(today(reservationDate));
          }}
          className="btn btn-secondary custom-btn"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            setReservationDate(next(reservationDate));
          }}
          className="btn btn-secondary custom-btn"
        >
          Next
        </button>
      </div>
      <ErrorAlert error={reservationsError} />
      <h2>Reservations:</h2>
      {reservations.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patron</th>
                <th>Phone #</th>
                <th>Date</th>
                <th>Time</th>
                <th>Size</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <Reservation
                  onCancel={onCancel}
                  reservation={reservation}
                  key={reservation.reservation_id}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>There are currently no reservations for {reservationDate}</p>
      )}

      <div>
        <h2>Tables</h2>
        {tables.length > 0 ? (
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Table</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tables.map((table) => (
                  <Table onFinish={onFinish} table={table} key={table.table_id} />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>There are currently no tables in the restaurant</p>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
