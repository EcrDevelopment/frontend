import React, { useState,useEffect } from 'react';
import { Select, Modal, Form, Input, InputNumber, DatePicker, Button, AutoComplete, notification, Alert, message, Space } from 'antd';
import axiosInstance from '../../../axiosConfig';
import moment from 'moment';

import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
// Formatos de fecha personalizados
const dateFormatList = ['DD/MM/YYYY', 'DD/MM/YY', 'DD-MM-YYYY', 'DD-MM-YY'];

// Componente para el formulario de cálculo de fletes
const { Option } = Select;


function FormularioCalculo({ onDataValidate,initialData}) {
    const [baseDatos, setBaseDatos] = useState('');
    const [query, setQuery] = useState([]);
    const [resultados, setResultados] = useState([]);
    const [resultadosTransportista, setResultadosTransportista] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [peso1, setPeso1] = useState('');
    const [peso2, setPeso2] = useState('');
    const [recojo1, setRecojo1] = useState(0);
    const [recojo2, setRecojo2] = useState(0);
    const [ocSeleccionada1, setocSeleccionada1] = useState(null); // Datos adicionales del registro 1
    const [ocSeleccionada2, setocSeleccionada2] = useState(null);
    const [modalMessage, setModalMessage] = useState('');
    const [form] = Form.useForm();
    const [modalForm] = Form.useForm();
    const [messageApi, contextHolder] = message.useMessage();

    const [formState, setFormState] = useState(initialData || {});

    useEffect(() => {
        if (initialData) {
            // Convertir la fechaNumeracion a un objeto moment
            if (initialData.fechaNumeracion) {
                initialData.fechaNumeracion = moment(initialData.fechaNumeracion); // Convertir a 'moment'
            }
            setFormState(initialData);  // Cargar los datos iniciales
            form.setFieldsValue(initialData);  // Establecer los valores en el formulario
        }
    }, [initialData, form]);

    // Función para manejar el cambio en el select de base de datos
    const handleBaseDatosChange = (value) => {
        setBaseDatos(value);
        setResultados([]); // Reiniciar sugerencias cuando cambia la base de datos
        setQuery(''); // Limpiar el campo de búsqueda
    };

    const buscarTransportista = async (termino) => {
        try {
            const response = await axiosInstance.get('/importaciones/buscar_prov/', {
                params: {
                    base_datos: baseDatos,
                    query: termino,
                },
            });
            setResultadosTransportista(response.data); // Actualiza el estado correcto
        } catch (error) {
            console.error('Error al buscar proveedor:', error);
        }
    };

    const handleSearchTransportista = (value) => {
        if (value.length > 1 && baseDatos) {
            buscarTransportista(value);
        } else {
            setResultadosTransportista([]); // Limpia los resultados si el término es corto o no hay base de datos seleccionada
        }
    };

    const handleSelectTransportista = (value) => {
        const proveedorSeleccionado = resultadosTransportista.find(prov => prov.nombre === value);
        if (proveedorSeleccionado) {
            form.setFieldsValue({
                transportista: proveedorSeleccionado.nombre,
            });
        }
    };

    // Función para realizar la búsqueda en la API
    const buscarImportaciones = async (termino) => {
        try {
            const response = await axiosInstance.get('/importaciones/buscar_oi/', {
                params: {
                    base_datos: baseDatos,
                    query: termino,
                },
            });
            setResultados(response.data);
        } catch (error) {
            console.error('Error al buscar importaciones:', error);
        }
    };


    const handleChange = (values) => {
        if (values.length <= 2) {
            // Si hay exactamente 2 órdenes seleccionadas, realizamos el cálculo especial
            if (values.length === 2) {
                setQuery(values);
                const [oc1, oc2] = values;
                const registro2 = resultados.find(registro => registro.CNUMERO === oc2);
                setocSeleccionada2(registro2);
                setModalVisible(true);
            } else if (values.length === 1) {
                setQuery(values);
                // Si solo hay una orden seleccionada, usar su precio directamente
                const registro = resultados.find(registro => registro.CNUMERO === values[0]);
                if (registro) {
                    setocSeleccionada1(registro);
                    form.setFieldsValue({
                        proveedor: registro.proveedor,
                        producto: registro.CDESARTIC,
                        precioProducto: registro.NPREUNITA,
                    });
                }
            }
        } else {
            // Mostrar notificación y revertir el cambio
            notification.warning({
                message: 'ALERTA',
                description: 'No puede seleccionar más de 2 órdenes de compra',
            });
        }

    };


    // Función para manejar la entrada del usuario
    const handleSearch = (value) => {
        //setQuery(value);
        if (value.length > 2 && baseDatos) {
            buscarImportaciones(value);
        } else {
            setResultados([]);
        }
    };

    // Función que se ejecuta al confirmar el modal
    const handleModalOk = async () => {
        try {
            // Validar los campos del formulario
            const values = await modalForm.validateFields();
            let sumaPesos = values.peso1 + values.peso2;
            let sumaTotalBruto = ((ocSeleccionada1.NPREUNITA * 1000) * values.peso1) + ((ocSeleccionada2.NPREUNITA * 1000) * values.peso2);
            let precioProrrateado = (sumaTotalBruto / sumaPesos).toFixed(2);
            let precioFinal = (precioProrrateado / 1000).toFixed(3);
            //console.log(`Peso 1: ${values.peso1}, Peso 2: ${values.peso2}`);
            //console.log(`precio 1: ${ocSeleccionada1.NPREUNITA * 1000}, precio 2: ${ocSeleccionada2.NPREUNITA * 1000}`);
            //console.log('precio prorrateado: ', precioFinal);
            form.setFieldsValue({
                proveedor: ocSeleccionada1.proveedor,
                producto: ocSeleccionada1.CDESARTIC,
                precioProducto: parseFloat(precioFinal),
                numRecojo: values.recojo1 + "," + values.recojo2,
            });

            setModalMessage('');
            // Cerrar el modal si todo está correcto
            setModalVisible(false);
        } catch (errorInfo) {
            //console.error('Error en validación:', errorInfo);
            setModalMessage('Por favor ingrese todos los valores correctamente.');
        }
    };

    //funcion para cuando se deselecciona una opcion en el select de oc:
    const handleDeselect=(value)=>{
        messageApi.error(`Quitaste las OC: ${value}`);
        const oc1=ocSeleccionada1;
        const oc2=ocSeleccionada2;
        if(oc1.CNUMERO===value){
            setocSeleccionada1(oc2);
            setocSeleccionada2("")
        }else if(oc2.CNUMERO===value){
            setocSeleccionada2(null);    
        }
        
    }

    // Función que se ejecuta al cancelar el modal
    const handleModalCancel = () => {   
        setModalVisible(false);     
        //setModalMessage("Completa el formulario para poder continuar");
        //messageApi.error("Completa el formulario para poder continuar");
    };

    const closeMessage = () => {
        setModalMessage('');
    };

    // Función para manejar el envío del formulario
    const onFinish = (values) => {
        let { numRecojo } = values;
    
        // Asegurarte de que numRecojo sea una cadena
        if (typeof numRecojo !== 'string') {
            numRecojo = String(numRecojo || ''); // Convertir a cadena
        }
    
        // Validar el formato (único número o lista separada por comas)
        if (!/^\d+(,\d+)*$/.test(numRecojo.trim())) {
            messageApi.error("El campo número de recojo solo acepta números separados por comas.");
            return;
        }
    
        // Convertir la cadena en un arreglo de números
        const numerosArray = numRecojo
            .split(",")
            .map((num) => parseInt(num.trim(), 10)) // Convertir los valores a números
            .filter((num) => !isNaN(num)); // Filtrar valores no numéricos
    
        // Determinar la cantidad de OC seleccionadas
        const numOCSeleccionadas = [ocSeleccionada1, ocSeleccionada2].filter(Boolean).length;
    
        // Verificar que la cantidad de números coincide con las OC seleccionadas
        if (numerosArray.length !== numOCSeleccionadas) {
            messageApi.error(`La cantidad de números de recojo (${numerosArray.length}) no coincide con la cantidad de OC seleccionadas (${numOCSeleccionadas}).`);
            return;
        }
    
        // Asignar los números de recojo a las OC seleccionadas
        const asignaciones = [];
        if (ocSeleccionada1) {
            asignaciones.push({ oc: ocSeleccionada1.CNUMERO, numeroRecojo: numerosArray[0] });
        }
        if (ocSeleccionada2) {
            asignaciones.push({ oc: ocSeleccionada2.CNUMERO, numeroRecojo: numerosArray[1] });
        }
    
        // Actualizar los valores en el formulario
        form.setFieldsValue({
            ordenRecojo: asignaciones,
        });
    
        onDataValidate(values);
    };
    
    

    return (
        <div className="w-full">
            {contextHolder}
            <Form
                form={form}
                onFinish={onFinish}
                layout="vertical"
                initialValues={{
                    producto: '',
                    proveedor: '',
                    dua: '',
                    numRecojo: 1,
                    cartaPorte: '',
                    numFactura: '',
                    fechaNumeracion: '',
                    transportista: '',
                    fletePactado: '',
                    presoNetoCrt: 0,
                    precioProducto: 0,
                }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                    {/* Empresa Select */}
                    <div className="">
                        <Form.Item
                            label="Empresa"
                            name="empresa"
                            rules={[{ required: true, message: 'Por favor, selecciona una empresa' }]} >
                            <Select
                                value={baseDatos}
                                onChange={handleBaseDatosChange}
                                placeholder="Selecciona una empresa"
                                className="w-full"
                            >
                                <Option value="bd_semilla_starsoft">LA SEMILLA DE ORO SAC</Option>
                                <Option value="bd_maxi_starsoft">MAXIMILIAN INVERSIONES SA</Option>
                                <Option value="bd_trading_starsoft">TRADING SEMILLA SAC</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    {/* OC Select */}
                    <div className="">
                        <Form.Item
                            label="Orden de compra"
                            name="oc"
                            rules={[{ required: true, message: 'Por favor, selecciona una OC' }]} >
                            <Select
                                mode="multiple" // Modo para selección múltiple
                                allowClear      // Permite limpiar las selecciones
                                value={query}
                                showSearch
                                onSearch={handleSearch}
                                onDeselect={handleDeselect}
                                onChange={handleChange} // Nuevo manejador para capturar los cambios
                                placeholder="Escribe al menos 3 caracteres"
                                className="w-full"
                                filterOption={false}
                                notFoundContent={null}
                            >
                                {resultados.map((registro) => (
                                    <Option key={registro.CNUMERO} value={registro.CNUMERO}>
                                        {registro.CNUMERO}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>

                    {/* Campos adicionales */}
                    <div className="">
                        <Form.Item
                            label="Producto"
                            name="producto"
                            rules={[{ required: true, message: 'Por favor, ingresa el producto' }]} >
                            <Input />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="precioProducto"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="ordenRecojo"
                        hidden
                    >
                        <Input />
                    </Form.Item>

                    <div className="">
                        <Form.Item
                            label="Proveedor"
                            name="proveedor"
                            rules={[{ required: true, message: 'Por favor, ingresa el proveedor' }]} >
                            <Input />
                        </Form.Item>
                    </div>

                    <div className="">
                        <Form.Item
                            label="DUA"
                            name="dua"
                            rules={[{ required: true, message: 'Por favor, ingresa el DUA' }]} >
                            <Input />
                        </Form.Item>
                    </div>

                    {/* numRecojo: Solo enteros */}
                    <div className="">
                        <Form.Item
                            label="Número de Recojo"
                            name="numRecojo"
                            rules={[{
                                required: true,
                                message: 'Por favor, ingresa el número de recojo',
                            }]} >
                            <Input placeholder="Ejemplo: 1,2" />
                        </Form.Item>
                    </div>

                    {/* fechaNumeracion: Fecha */}
                    <div className="">
                        <Form.Item
                            label="Fecha de Numeración"
                            name="fechaNumeracion"
                            rules={[{
                                required: true,
                                message: 'Por favor, ingresa la fecha de numeración',
                            }, {
                                type: 'date',
                                message: 'Por favor, ingresa una fecha válida',
                            }]} >
                            <DatePicker format={"DD/MM/YYYY"} style={{ width: '100%' }} />
                        </Form.Item>
                    </div>
                    <div className="">
                        <Form.Item
                            label="Carte porte"
                            name="cartaPorte"
                            rules={[{ required: true, message: 'Por favor, ingresa carta porte' }]} >
                            <Input />
                        </Form.Item>
                    </div>
                    <div className="">
                        <Form.Item
                            label="N° Factura"
                            name="numFactura"
                            rules={[{ required: true, message: 'Por favor, ingresa el N° de factura' }]} >
                            <Input />
                        </Form.Item>
                    </div>

                    <div className="">
                        <Form.Item
                            label="Empresa de Transporte"
                            name="transportista"
                            rules={[{ required: true, message: 'Por favor, ingresa Emp. de transporte' }]} >

                            <AutoComplete
                                value={query}
                                options={resultadosTransportista.map((prov) => ({ value: prov.nombre }))}
                                onSelect={handleSelectTransportista}
                                onSearch={handleSearchTransportista}
                                placeholder="Buscar proveedor"
                            />
                        </Form.Item>

                    </div>

                    {/* fletePactado: Decimales */}
                    <div className="">
                        <Form.Item
                            label="Flete Pactado"
                            name="fletePactado"
                            rules={[{
                                required: true,
                                message: 'Por favor, ingresa el flete pactado',
                            }, {
                                type: 'number',
                                transform: (value) => value ? parseFloat(value) : 0,
                                message: 'El flete pactado debe ser un número decimal',
                            }]}>
                            <InputNumber
                                min={1.0}
                                step={0.01}
                                style={{ width: '100%' }}
                                prefix="$"
                            />
                        </Form.Item>

                    </div>
                    <div className="">
                        <Form.Item
                            label="Peso neto CRT (kg)"
                            name="pesoNetoCrt"
                            rules={[{
                                required: true,
                                message: 'Por favor, ingresa el peso neto de la carta porte.',
                            }, {
                                type: 'number',
                                transform: (value) => value ? parseFloat(value) : 0,
                                message: 'El peso debe ser un número decimal',
                            }]}>
                            <InputNumber
                                min={1.0}
                                step={0.01}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                    </div>

                    {/* Botón de enviar */}
                    <div className="md:mt-7 lg:mt-7">
                        <Button type="primary" htmlType="submit" className="w-full">
                            Enviar
                        </Button>
                    </div>
                </div>
            </Form>

            {/* Modal para prorrateo de ordenes de compra */}

            <Modal
                title="Prorrateo de precio"
                open={modalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="Calcular"
                cancelText="Cancelar"
            >
                {modalMessage ? (
                    <Alert
                        message={modalMessage} // El mensaje que deseas mostrar
                        type="warning" // Tipo de alerta
                        showIcon // Mostrar icono de advertencia
                        closable // Habilitar cierre del alert
                        onClose={closeMessage} // Función para cerrar el alert
                    />
                ) : null}

                <Form form={modalForm} layout="vertical">
                    {/* Información y primer input */}
                    <div className='pt-3 px-3 mt-3 border rounded rounded-md shadow-md bg-gray-200'>
                        <p>{ocSeleccionada1 ? `${ocSeleccionada1.CNUMERO} - ${ocSeleccionada1.CDESARTIC}` : ''}</p>
                        <div className='flex gap-4 justify-items-sapce-around'>
                            <Form.Item
                                name="peso1"
                                label="Peso"
                                rules={[{
                                    required: true,
                                    message: 'Por favor, completa este campo',
                                }, {
                                    type: 'number',
                                    transform: (value) => value ? parseFloat(value) : 0,
                                    message: 'Este campo solo admite números',
                                }]}>
                                <InputNumber
                                    min={1.0}
                                    step={0.01}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                name="recojo1"
                                label="Número de recojo"
                                rules={[{
                                    required: true,
                                    message: 'Por favor, completa este campo',
                                }, {
                                    type: 'number',
                                    transform: (value) => value ? parseInt(value) : 0,
                                    message: 'Este campo solo admite números',
                                }]}>
                                <InputNumber
                                    min={1}
                                    step={1}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div className='pt-3 px-3 mt-3 border rounded rounded-md shadow-md bg-gray-200'>
                        <p>{ocSeleccionada2 ? `${ocSeleccionada2.CNUMERO} - ${ocSeleccionada2.CDESARTIC}` : ''}</p>
                        <div className='flex gap-4 justify-items-sapce-around'>
                            <Form.Item
                                name="peso2"
                                label="Peso"
                                rules={[{
                                    required: true,
                                    message: 'Por favor, completa este campo',
                                }, {
                                    type: 'number',
                                    transform: (value) => value ? parseFloat(value) : 0,
                                    message: 'Este campo solo admite números',
                                }]}>
                                <InputNumber
                                    min={1.0}
                                    step={0.01}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                            <Form.Item
                                name="recojo2"
                                label="Número de recojo"
                                rules={[{
                                    required: true,
                                    message: 'Por favor, completa este campo',
                                }, {
                                    type: 'number',
                                    transform: (value) => value ? parseInt(value) : 0,
                                    message: 'Este campo solo admite números',
                                }]}>
                                <InputNumber
                                    min={1}
                                    step={1}
                                    style={{ width: '100%' }}
                                />
                            </Form.Item>
                        </div>
                    </div>
                </Form>
            </Modal>
        </div>
    );
}

export default FormularioCalculo;
