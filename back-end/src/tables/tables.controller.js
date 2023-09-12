const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");
const reservationsService = require("../reservations/reservations.service");

// Middleware to check if the request body contains data
function bodyHasData(req, res, next) {
    const { data } = req.body;
    if (!data) {
        next({
            status: 400,
            message: "body",
        });
    }
    next();
}

// Middleware to check if the request body contains a reservation ID
function bodyHasReservationId(req, res, next) {
    const { reservation_id } = req.body.data;
    if (!reservation_id) {
        return next({
            status: 400,
            message: "reservation_id",
        });
    }
    res.locals.reservation_id = reservation_id;
    next();
}

// Middleware to check if the request body contains capacity
function hasCapacity(req, res, next) {
    const { capacity } = req.body.data;
    if (!capacity) {
        next({ status: 400, message: "capacity" });
    } else {
        next();
    }
}

// Middleware to validate if the capacity is a positive integer
function isValidCapacity(req, res, next) {
    const { capacity } = req.body.data;
    if (capacity === 0 || !Number.isInteger(capacity)) {
        next({ status: 400, message: "capacity" });
    }
    next();
}

// Middleware to validate the table name
function isValidName(req, res, next) {
    const { table_name } = req.body.data;
    if (!table_name || !table_name.length || table_name.length === 1) {
        return next({ status: 400, message: "table_name" });
    }
    next();
}

// Middleware to check if a table with a given ID exists
async function tableExists(req, res, next) {
    const { table_id } = req.params;
    const table = await service.read(Number(table_id));
    if (table) {
        res.locals.table = table;
        next();
    } else {
        next({
            status: 404,
            message: table_id,
        });
    }
}

// Middleware to check if the table has enough capacity for a reservation
function isTableBigEnough(req, res, next) {
    const { capacity } = res.locals.table;
    const { people } = res.locals.reservation;
    if (capacity >= people) return next();
    next({
        status: 400,
        message: "capacity",
    });
}

// Middleware to check if the table is available (not occupied)
function isAvailable(req, res, next) {
    if (!res.locals.table.reservation_id) return next();
    next({
        status: 400,
        message: `occupied`,
    });
}

// Middleware to check if the table is occupied
function isOccupied(req, res, next) {
    if (res.locals.table.reservation_id) return next();
    next({
        status: 400,
        message: `not occupied`,
    });
}

// Middleware to check if a reservation with a given ID exists
async function reservationIdExists(req, res, next) {
    const reservation = await reservationsService.read(res.locals.reservation_id);
    if (!reservation) {
        return next({ status: 404, message: `${res.locals.reservation_id}` });
    } else {
        res.locals.reservation = reservation;
        next();
    }
}

// Middleware to check if a reservation is not already seated
function isReservationSeated(req, res, next) {
    if (res.locals.reservation.status === "seated") {
        return next({
            status: 400,
            message: "reservation is already seated",
        });
    }
    next();
}

// Create a new table
async function create(req, res, next) {
    res.status(201).json({ data: await service.create(req.body.data) });
}

// List all tables
async function list(req, res, next) {
    res.status(200).json({ data: await service.list() });
}

// Seat a reservation at a table
async function seat(req, res, next) {
    const data = await service.seat(
        res.locals.table.table_id,
        res.locals.reservation_id
    );
    res.status(200).json({ data });
}

// Finish a reservation at a table
async function finish(req, res, next) {
    const data = await service.finish(res.locals.table);
    res.status(200).json({ data });
}

module.exports = {
    create: [
        bodyHasData,
        hasCapacity,
        isValidName,
        isValidCapacity,
        asyncErrorBoundary(create),
    ],
    seat: [
        bodyHasData,
        bodyHasReservationId,
        asyncErrorBoundary(reservationIdExists),
        isReservationSeated,
        asyncErrorBoundary(tableExists),
        isTableBigEnough,
        isAvailable,
        asyncErrorBoundary(seat),
    ],
    finish: [
        asyncErrorBoundary(tableExists),
        isOccupied,
        asyncErrorBoundary(finish),
    ],
    list: asyncErrorBoundary(list),
};
