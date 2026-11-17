export const leccionesCobrosDigitales = [
  {
    "titulo": "Introducción a los Cobros Digitales y SPEI",
    "intro": "Aprende qué ocurre cuando envías dinero desde una aplicación bancaria y cómo comprobar una transferencia.",
    "bloques": [
      [
        "Qué es un pago digital",
        "Puedes pagar un servicio, dividir un gasto o enviar dinero a otra persona desde una aplicación. Cada operación debe quedar asociada a un destinatario, un importe y un registro que puedas consultar."
      ],
      [
        "Para qué sirve el SPEI",
        "El Sistema de Pagos Electrónicos Interbancarios permite transferir dinero entre cuentas de distintas instituciones participantes. La clave de rastreo identifica la operación y el Comprobante Electrónico de Pago (CEP) se puede consultar en Banco de México cuando se cumplen las condiciones para emitirlo."
      ],
      [
        "Cómo dar seguimiento a una transferencia",
        "Lucía envía $250 por un libro. Guarda la hora, el importe y la clave de rastreo. Si la persona vendedora dice que todavía no ve el abono, Lucía consulta el estado con esos datos antes de decidir qué hacer.",
        "Anota tres datos que usarías para aclarar el pago. Explica qué podría pasar si repites la transferencia mientras la primera sigue en revisión."
      ]
    ],
    "ejemplo": {
      "titulo": "Transferencia de práctica",
      "datos": [
        [
          "Importe",
          "$250 MXN"
        ],
        [
          "Concepto",
          "Libro"
        ],
        [
          "Cuenta de ejemplo",
          "Terminación 1234"
        ]
      ]
    },
    "recursos": [
      [
        "Consulta del CEP en Banco de México",
        "https://www.banxico.org.mx/cep/"
      ]
    ],
    "caso": {
      "pregunta": "En tu pantalla de confirmación aparecen $520, pero acordaste pagar $250. ¿Qué haces?",
      "opciones": [
        "Autorizo y aviso después",
        "Regreso y verifico el importe antes de autorizar",
        "Cambio el concepto y autorizo"
      ],
      "correcta": 1,
      "explicacion": "El concepto ayuda a identificar la operación. El importe es el que determina cuánto dinero envías."
    }
  },
  {
    "titulo": "Métodos y Plataformas de Pago Digitales",
    "intro": "Identifica cómo funciona cada método de pago y qué conviene revisar antes de elegirlo.",
    "bloques": [
      [
        "Transferencia, cartera digital y tarjeta",
        "Una transferencia envía dinero de una cuenta a otra. Una plataforma como PayPal o Mercado Pago puede procesar un pago al comercio. Una tarjeta digital ofrece datos de pago que puedes consultar en la aplicación de tu institución."
      ],
      [
        "Costos y comprobantes",
        "Antes de decidir, revisa el costo total, qué comprobante tendrás y quién atiende las aclaraciones. Algunos productos usan un código de seguridad dinámico, que cambia y se consulta cuando lo necesitas."
      ],
      [
        "Compara el costo total y el plazo de abono",
        "Una persona que vende desayunos cobra $300 por pedido. Si el servicio de cobro retiene $12, recibe $288. Si necesita comprar ingredientes al día siguiente, también debe considerar cuándo podrá disponer del dinero.",
        "Compara dos opciones simuladas: $288 disponibles mañana o $291 disponibles en tres días. Elige una para un pedido con gastos inmediatos y justifica tu decisión."
      ]
    ],
    "ejemplo": {
      "titulo": "Opciones para una compra",
      "datos": [
        [
          "Artículo",
          "Mochila"
        ],
        [
          "Precio publicado",
          "$480 MXN"
        ],
        [
          "Datos que comparar",
          "Comisión y comprobante"
        ]
      ]
    },
    "caso": {
      "pregunta": "Dos medios te permiten comprar el mismo artículo. ¿Qué conviene comparar?",
      "opciones": [
        "El color de los botones",
        "La cantidad de pantallas únicamente",
        "El total, el comprobante y el canal de aclaración"
      ],
      "correcta": 2,
      "explicacion": "El costo final y el respaldo disponible te permiten comparar opciones para una misma compra."
    }
  },
  {
    "titulo": "Envíos de Dinero, Links de Cobro y Códigos QR",
    "intro": "Distingue entre enviar dinero directamente y solicitar un pago mediante un enlace o código.",
    "bloques": [
      [
        "Cómo funciona una solicitud de cobro",
        "Un enlace abre una pantalla de pago. Un código QR de cobro, como los que se utilizan con CoDi, permite leer una solicitud con una aplicación compatible. Antes de autorizar, comprueba a quién estás pagando y cuánto."
      ],
      [
        "Cómo registrar gastos compartidos",
        "Si varias personas deben aportar, asigna una referencia al gasto y lleva un registro de lo acordado y lo recibido. Si una persona paga en partes, anota cada abono y calcula el saldo pendiente."
      ],
      [
        "Registra el pago de cada pedido",
        "Asigna una referencia a cada pedido, por ejemplo PAN-042. Si dos clientes pagan el mismo importe, la referencia y la fecha te ayudan a relacionar cada movimiento con su pedido.",
        "Imagina que dos pedidos de $180 aparecen como pendientes. Prepara dos referencias distintas y describe qué revisarías en el historial antes de entregar cada uno."
      ]
    ],
    "ejemplo": {
      "titulo": "Cuenta compartida",
      "datos": [
        [
          "Total",
          "$630 MXN"
        ],
        [
          "Participantes",
          "3"
        ],
        [
          "Aportación por persona",
          "$210 MXN"
        ]
      ]
    },
    "caso": {
      "pregunta": "Una persona te envía una captura del pago, pero el abono sigue sin aparecer. ¿Qué haces?",
      "opciones": [
        "Dejo el cobro pendiente y reviso los movimientos de mi cuenta",
        "Marco el pago como recibido con la captura",
        "Comparto mi contraseña para que verifique el depósito"
      ],
      "correcta": 0,
      "explicacion": "Una captura se puede reenviar o modificar. Revisa el abono en tu propia aplicación antes de cerrar el cobro."
    }
  },
  {
    "titulo": "Compras Seguras en Línea y Prevención de Fraudes",
    "intro": "Aprende a verificar un comercio, revisar el total y responder ante avisos inesperados relacionados con una compra.",
    "bloques": [
      [
        "Datos que conviene revisar en una tienda",
        "Verifica que el dominio coincida con el comercio. Busca información de contacto y lee cómo funcionan el envío, las devoluciones y las aclaraciones. Conserva el resumen del pedido y el comprobante."
      ],
      [
        "Datos que debes proteger al pagar",
        "Usa el medio de pago que puedas revisar desde tu cuenta. Si empleas una tarjeta digital, captura sus datos únicamente en la pantalla de pago verificada. Un mensaje que solicita un NIP, contraseña o código de acceso requiere comprobar qué pasa desde el canal oficial."
      ],
      [
        "Guarda la evidencia de la compra",
        "Antes de pagar, abre el sitio del comercio desde una dirección que puedas verificar y consulta sus condiciones de devolución. Conserva el número de pedido, la fecha prometida y el total. Con esos datos podrás explicar con precisión qué ocurrió si necesitas contactar al comercio.",
        "Simula una compra de $480 con $65 de envío. Escribe el total y prepara un registro que usarías si la entrega se retrasa."
      ]
    ],
    "ejemplo": {
      "titulo": "Resumen de una compra",
      "datos": [
        [
          "Producto",
          "$550 MXN"
        ],
        [
          "Envío",
          "$80 MXN"
        ],
        [
          "Total",
          "$630 MXN"
        ]
      ]
    },
    "caso": {
      "pregunta": "Un mensaje sobre tu compra pide un código bancario para liberar la entrega. ¿Qué haces?",
      "opciones": [
        "Respondo con el código",
        "Abro el pedido desde la app o el sitio oficial para verificarlo",
        "Reenvío el código al supuesto repartidor"
      ],
      "correcta": 1,
      "explicacion": "Consulta el pedido por un canal conocido. Un código bancario puede autorizar un acceso o una operación."
    }
  },
  {
    "titulo": "Gestión y Control de Finanzas Personales",
    "intro": "Usa tu historial de pagos para distinguir gastos habituales, detectar cargos inesperados y planear lo que aún puedes gastar.",
    "bloques": [
      [
        "Presupuesto y movimientos",
        "Define cuánto puedes gastar durante la semana. Registra cada pago una sola vez y distingue entre el saldo disponible y los compromisos próximos, como un servicio que se cobra a fin de mes."
      ],
      [
        "Suscripciones y avisos",
        "Revisa la frecuencia y fecha de renovación de tus suscripciones. Si decides cancelar alguna, conserva la confirmación. Las alertas de movimiento ayudan a detectar cargos y la revisión periódica permite confirmar cuáles se aplicaron."
      ],
      [
        "Planea con el dinero que ya tienes",
        "Si recibes $1,200, reservas $650 para gastos fijos y $200 para un objetivo de ahorro, quedan $350 disponibles. Registra aparte un cobro que esperas recibir el viernes hasta que se refleje en tu cuenta.",
        "Si gastas $95 de los $350 disponibles, calcula el saldo y decide si puedes cubrir una compra de $280 sin tocar las reservas."
      ]
    ],
    "ejemplo": {
      "titulo": "Presupuesto semanal",
      "datos": [
        [
          "Presupuesto",
          "$900 MXN"
        ],
        [
          "Gastos registrados",
          "$599 MXN"
        ],
        [
          "Disponible",
          "$301 MXN"
        ]
      ]
    },
    "caso": {
      "pregunta": "Tu presupuesto es de $900 y ya registraste $599 en gastos. ¿Cuánto queda antes de nuevos cargos?",
      "opciones": [
        "$599",
        "$1,499",
        "$301"
      ],
      "correcta": 2,
      "explicacion": "Resta el gasto registrado al presupuesto. En este ejemplo, $900 menos $599 deja $301."
    }
  }
];
