--Tabla Vehiculos--
CREATE TABLE Vehiculos (
    vehiculo_id INT PRIMARY KEY AUTO_INCREMENT,
    matricula VARCHAR(20) NOT NULL UNIQUE,
    tipo_vehiculo VARCHAR(20),
    nombre_propietario VARCHAR(100)
);

--Tabla EspaciosEstacionamientos --
CREATE TABLE EspaciosEstacionamiento (
    espacio_id INT PRIMARY KEY AUTO_INCREMENT,
    numero_espacio VARCHAR(10) NOT NULL UNIQUE,
    estado VARCHAR(20) NOT NULL DEFAULT 'Disponible', -- 'Disponible' o 'Ocupado'
    vehiculo_id INT,
    FOREIGN KEY (vehiculo_id) REFERENCES Vehiculos(vehiculo_id)
);

--Tabla Tarifas --
CREATE TABLE Tarifas (
    tarifa_id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_vehiculo VARCHAR(20) NOT NULL,
    tarifa_por_hora DECIMAL(10,2) NOT NULL
);

--Tabla Movimientos --
CREATE TABLE Movimientos (
    movimiento_id INT PRIMARY KEY AUTO_INCREMENT,
    vehiculo_id INT NOT NULL,
    entrada DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    salida DATETIME,
    espacio_id INT NOT NULL,
    costo DECIMAL(10,2),
    FOREIGN KEY (vehiculo_id) REFERENCES Vehiculos(vehiculo_id),
    FOREIGN KEY (espacio_id) REFERENCES EspaciosEstacionamiento(espacio_id)
);

--calculo automatico de costo--
UPDATE Movimientos m
JOIN Vehiculos v ON m.vehiculo_id = v.vehiculo_id
JOIN Tarifas t ON v.tipo_vehiculo = t.tipo_vehiculo
SET
    m.salida = NOW(),
    m.costo = TIMESTAMPDIFF(HOUR, m.entrada, NOW()) * t.tarifa_por_hora
WHERE m.movimiento_id = [ID_DEL_MOVIMIENTO];

--gestion disponibilidad de espacios --
--actulizar el estado del espacio --
UPDATE EspaciosEstacionamiento
SET estado = 'Ocupado', vehiculo_id = [ID_DEL_VEHICULO]
WHERE espacio_id = [ID_DEL_ESPACIO];
--registrar movimientos de entrada--
INSERT INTO Movimientos (vehiculo_id, espacio_id)
VALUES ([ID_DEL_VEHICULO], [ID_DEL_ESPACIO]);

--al salir un vehiculo--
--actualizar el estado del espacio a disponible--
UPDATE EspaciosEstacionamiento
SET estado = 'Disponible', vehiculo_id = NULL
WHERE espacio_id = [ID_DEL_ESPACIO];

--hitorial de movimientos de cada vehiculos--
SELECT m.*, e.numero_espacio
FROM Movimientos m
JOIN EspaciosEstacionamiento e ON m.espacio_id = e.espacio_id
WHERE m.vehiculo_id = [ID_DEL_VEHICULO]
ORDER BY m.entrada DESC;
