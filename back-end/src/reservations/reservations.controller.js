/**
 * List handler for reservation resources
 */
const service = require("./reservations.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

// Middleware to check if body contains data
function hasBodyData(req, res, next) {
  const { data } = req.body;
  if (!data) {
    next({
      status: 400,
    });
  }
  next();
}

// Middleware to validate that a name exists and is not empty
function nameIsValid(req, res, next) {
  const { first_name, last_name } = req.body.data;
  const error = { status: 400 };
  if (!first_name || !first_name.length) {
    error.message = `first_name`;
    return next(error);
  }
  if (!last_name || !last_name.length) {
    error.message = `last_name`;
    return next(error);
  }

  next();
}

// Middleware to validate that a mobile number exists
function mobileNumberIsValid(req, res, next) {
  const { mobile_number } = req.body.data;
  if (!mobile_number) {
    return next({
      status: 400,
      message: "mobile_number",
    });
  }
  next();
}

// Middleware to validate that a reservation date exists and is correctly formatted
function dateIsValid(req, res, next) {
  const { reservation_date } = req.body.data;
  if (!reservation_date || new Date(reservation_date) == "Invalid Date") {
    return next({
      status: 400,
      message: "reservation_date",
    });
  }
  next();
}

// Middleware to validate that a reservation time exists and is correctly formatted
function timeIsValid(req, res, next) {
  let { reservation_time } = req.body.data;

  const error = {
    status: 400,
    message: "reservation_time",
  };
  if (!reservation_time) return next(error);
  if (reservation_time[2] === ":") {
    // Remove colon
    reservation_time = reservation_time.replace(":", "");
    // Remove only store hours minutes
    reservation_time = reservation_time.substring(0, 4);
  }
  res.locals.hour = reservation_time.substring(0, 2);
  res.locals.mins = reservation_time.substring(2, 4);
  if (Number.isInteger(Number(reservation_time))) {
    next();
  } else {
    next(error);
  }
}

// Middleware to validate that the number of people is a positive integer
function peopleIsValid(req, res, next) {
  const { people } = req.body.data;
  if (!people || !Number.isInteger(people) || people <= 0) {
    return next({
      status: 400,
      message: `people`,
    });
  }
  next();
}

// Middleware to check if a reservation with a given ID exists
async function reservationExists(req, res, next) {
  const reservation = await service.read(req.params.reservation_id);
  if (reservation) {
    res.locals.reservation = reservation;
    return next();
  }
  next({
    status: 404,
    message: `${req.params.reservation_id}`,
  });
}

// Middleware to check if the reservation date is in the future
function dateIsInTheFuture(req, res, next) {
  const { reservation_date, reservation_time } = req.body.data;
  const dateTime = new Date(`${reservation_date}T${reservation_time}`);
  if (dateTime < new Date()) {
    return next({
      status: 400,
      message: "Reservation must be in the future",
    });
  }
  next();
}

// Middleware to check if the reservation date is not a Tuesday (Restaurant closed on Tuesdays)
function dateIsNotTuesday(req, res, next) {
  const { reservation_date } = req.body.data;
  const day = new Date(reservation_date).getUTCDay();
  if (day === 2) {
    return next({
      status: 400,
      message: "Restaurant is closed on Tuesdays",
    });
  }
  next();
}

// Middleware to check if the reservation time is within open hours
function isDuringOpenHours(req, res, next) {
  const { hour, mins } = res.locals;
  if (hour >= 22 || (hour <= 10 && mins <= 30)) {
    return next({
      status: 400,
      message: "We are not open at that time",
    });
  }
  next();
}

// Middleware to validate that a new status is valid
function newStatusIsValid(req, res, next) {
  const { status } = req.body.data;
  if (
    (status && status === "booked") ||
    status === "seated" ||
    status === "finished" ||
    status === "cancelled"
  ) {
    return next();
  }
  next({
    status: 400,
    message: status,
  });
}

// Middleware to check if a reservation is not marked as "finished"
function isNotFinished(req, res, next) {
  if (res.locals.reservation.status === "finished") {
    return next({
      status: 400,
      message: "finished",
    });
  }
  next();
}

// List reservations
async function list(req, res, next) {
  const { date, mobile_number } = req.query;
  let data;
  if (date) {
    data = await service.listOnDate(date);
  } else if (mobile_number) {
    data = await service.listForNumber(mobile_number);
  } else {
    data = await service.list();
  }
  res.status(200).json({ data });
}

// Create a reservation
async function create(req, res, next) {
  const reservation = req.body.data;
  const { status } = reservation;

  if (status && (status === "seated" || status === "finished")) {
    return next({
      status: 400,
      message: status,
    });
  }
  reservation.status = "booked";
  const data = await service.create(req.body.data);
  if (data) {
    return res.status(201).json({ data });
  }
  next({
    status: 500,
    message: "Failed to create reservation",
  });
}

// Read a reservation
async function read(req, res, next) {
  res.json({ data: res.locals.reservation });
}

// Update a reservation
async function update(req, res, next) {
  const updatedReservation = req.body.data;

  const data = await service.update(updatedReservation);
  res.json({ data });
}

// Update the status of a reservation
async function status(req, res, next) {
  res.locals.reservation.status = req.body.data.status;
  const data = await service.update(res.locals.reservation);
  res.json({ data });
}

module.exports = {
  create: [
    hasBodyData,
    nameIsValid,
    mobileNumberIsValid,
    dateIsValid,
    timeIsValid,
    peopleIsValid,
    dateIsInTheFuture,
    dateIsNotTuesday,
    isDuringOpenHours,
    asyncErrorBoundary(create),
  ],
  list: asyncErrorBoundary(list),
  read: [asyncErrorBoundary(reservationExists), read],
  update: [
    hasBodyData,
    nameIsValid,
    mobileNumberIsValid,
    dateIsValid,
    timeIsValid,
    peopleIsValid,
    dateIsInTheFuture,
    dateIsNotTuesday,
    isDuringOpenHours,
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(update),
  ],
  status: [
    hasBodyData,
    asyncErrorBoundary(reservationExists),
    isNotFinished,
    newStatusIsValid,
    asyncErrorBoundary(status),
  ],
};