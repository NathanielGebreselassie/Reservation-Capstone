import React, { useState } from "react";
import ErrorAlert from "../layout/ErrorAlert";
import { listReservations } from "../utils/api";
import Reservation from "../layout/Reservation/Reservation";

function Search(onCancel = () => { }) {
  const [reservations, setReservations] = useState([]);
  const [mobile_number, setMobileNumber] = useState("");
  const [error, setError] = useState(null);

  function handleChange({ target: { value } }) {
    setMobileNumber(value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (mobile_number === "") {
      setError(new Error("Please enter a mobile number before searching."));
      return;
    }
    const abortController = new AbortController();

    listReservations({ mobile_number }, abortController.signal)
      .then((reservations) => {
        if (reservations.length === 0) {
          setError(new Error("No reservations found"));
        } else {
          setReservations(reservations);
          setError(null); // Clear the error
        }
      })
      .catch((error) => setError(new Error(error.message)));
  }

  return (
    <main style={{ textAlign: "left" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "30px" }}>
        Search for Reservation by Phone Number
      </h1>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit} style={{ display: "flex", justifyContent: "left" }}>
        <label style={{ fontSize: "20px", fontWeight: "bold", marginRight: "20px" }}>
          Mobile Number:
          <input
            type="text"
            id="mobile_number"
            name="mobile_number"
            className="form-control"
            onChange={handleChange}
            value={mobile_number}
            placeholder="Enter Mobile Number"
            style={{ flex: "1", padding: "10px", borderRadius: "6px", marginLeft: "0" }}
            pattern="[0-9\-]+"
          />
        </label>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ padding: "10px 16px", marginLeft: "2px", marginTop: "20px", marginBottom: "7px", borderRadius: "6px", fontSize: "16px" }}
        >
          Find
        </button>
      </form>
      <div>
        {reservations.length > 0 && (
          <div className="table-responsive">
            <table className="table" style={{ marginTop: "30px" }}>
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
        )}
      </div>
    </main>
  );
}

export default Search;
