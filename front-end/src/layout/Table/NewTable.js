import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../../utils/api";
import ErrorAlert from "../ErrorAlert";

function NewTable() {
  const history = useHistory();
  const initialState = {
    table_name: "",
    capacity: 0,
  };

  const [table, setTable] = useState({ ...initialState });
  const [error, setError] = useState(null);

  const handleChange = ({ target: { name, value } }) => {
    if (name === "capacity") {
      setTable({
        ...table,
        [name]: Number(value),
      });
    } else {
      setTable({
        ...table,
        [name]: value,
      });
    }
  };

  function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();

    setError(null);
    createTable(table, abortController.signal)
      .then(() => history.push("/dashboard"))
      .catch((error) => {
        setError(error);
      });
    return () => abortController.abort();
  }

  return (
    <main style={{ textAlign: "left" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        Create Table
      </h1>
      <ErrorAlert error={error} />
      <form name="table-form" onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="table-name" style={{ fontSize: "18px", fontWeight: "bold", marginRight: "10px" }}>
            Table Name:
          </label>
          <input
            id="table-name"
            name="table_name"
            type="text"
            onChange={handleChange}
            value={table.table_name}
            required
            style={{ width: "200px", padding: "8px", borderRadius: "4px" }}
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="table-capacity" style={{ fontSize: "18px", fontWeight: "bold", marginRight: "10px" }}>
            Capacity:
          </label>
          <input
            id="table-capacity"
            name="capacity"
            type="number"
            onChange={handleChange}
            value={table.capacity}
            required
            style={{ width: "60px", padding: "8px", borderRadius: "4px" }}
          />
        </div>
        <button
          type="button"
          className="btn btn-secondary mr-2"
          onClick={() => history.goBack()}
          style={{ marginTop: "20px", padding: "8px 16px" }}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          style={{ marginTop: "20px", padding: "8px 16px" }}
        >
          Submit
        </button>
      </form>
    </main>
  );
}

export default NewTable;
