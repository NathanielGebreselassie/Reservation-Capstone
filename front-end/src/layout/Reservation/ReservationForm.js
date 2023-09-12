import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../ErrorAlert";
import {
  createReservation,
  readReservation,
  updateReservation,
} from "../../utils/api";

function ReservationForm() {
  const history = useHistory();
  const { reservation_id } = useParams();

  const initialFormState = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 1,
  };

  const [reservation, setReservation] = useState({ ...initialFormState });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (reservation_id) {
      setError(null);
      readReservation(reservation_id)
        .then(setReservation)
        .catch(setError);
    }
  }, [reservation_id]);

  const handleChange = ({ target }) => {
    const { value, name } = target;
    setReservation({
      ...reservation,
      [name]: name === "people" ? Number(value) : value,
    });
  };

  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();

    if (reservation_id) {
      // Update
      updateReservation(reservation)
        .then(() =>
          history.push(`/dashboard/?date=${reservation.reservation_date}`)
        )
        .catch((error) => {
          setError(error);
        });
    } else {
      createReservation(reservation)
        .then(() =>
          history.push(`/dashboard/?date=${reservation.reservation_date}`)
        )
        .catch((error) => {
          setError(error);
        });
    }
    return () => abortController.abort();
  }

  return (
    <main>
      <ErrorAlert error={error} />
      <form name="reservation-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="first-name" style={{ fontWeight: "bold" }}>
            First Name
          </label>
          <input
            id="first-name"
            name="first_name"
            type="text"
            onChange={handleChange}
            value={reservation.first_name}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label htmlFor="last-name" style={{ fontWeight: "bold" }}>
            Last Name
          </label>
          <input
            id="last-name"
            name="last_name"
            type="text"
            onChange={handleChange}
            value={reservation.last_name}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label
            htmlFor="mobile-number"
            style={{ fontWeight: "bold", display: "block" }}
          >
            Mobile Number
          </label>
          <input
            id="mobile-number"
            name="mobile_number"
            type="text"
            pattern="[\d\-]+"
            onChange={handleChange}
            value={reservation.mobile_number}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label htmlFor="reservation-date" style={{ fontWeight: "bold" }}>
            Date
          </label>
          <input
            id="reservation-date"
            name="reservation_date"
            type="date"
            onChange={handleChange}
            value={reservation.reservation_date}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label htmlFor="reservation-time" style={{ fontWeight: "bold" }}>
            Time
          </label>
          <input
            id="reservation-time"
            name="reservation_time"
            type="time"
            onChange={handleChange}
            value={reservation.reservation_time}
            required
            style={{ width: "100%" }}
          />
        </div>
        <div>
          <label htmlFor="people" style={{ fontWeight: "bold" }}>
            People
          </label>
          <input
            id="people"
            name="people"
            onChange={handleChange}
            value={reservation.people}
            required
            style={{ width: "100%" }}
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary mr-2"
          onClick={() => history.goBack()}
          style={{ margin: "10px 0" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ margin: "10px 0" }}
        >
          Submit
        </button>
      </form>
    </main>
  );
}

export default ReservationForm;
