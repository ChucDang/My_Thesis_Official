import React, { useEffect, useRef } from 'react'
import { Button, Offcanvas, Form, Container, DropdownButton, Dropdown, Row, Col } from 'react-bootstrap'
import { useState } from 'react';
import PersonIcon from '@mui/icons-material/Person'
import "./Login.scss"
import { Navigate, useNavigate } from 'react-router-dom';
import { useLocalState } from '../../Services/useLocalStorage';
import { useLoading } from '../../Services/LoadingProvider';

import { ROLE_ENUM } from '../../Constants/roles';
export default function LoginComponent() {
    const loading = useLoading();
    const [user, setUser] = useLocalState('user', null)
    const [orders, setOrders] = useLocalState('orders', null)
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState(null);

    async function sendLoginRequest() {
        setErrorMsg("");
        const reqBody = {
            username: username,
            password: password,
        };

        const response = await fetch("/api/auth/login", {
            headers: {
                "Content-Type": "application/json",
            },
            method: "post",
            body: JSON.stringify(reqBody)
        })

        if (response.status === 200) {
            let _jwt = await response.headers.get('Authorization')
            let _user = await response.json()
            await setUser(_user)
            await loading.setDisplayName(_user.fullname)
            await loading.setJwt(_jwt)
            await loading.setUser(_user)
            await loading.setCount(0)
            if (_user && _user.authorities[0].authority === ROLE_ENUM.CUSTOMER) {
                const response = await fetch('/cart', {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${_jwt}`
                    },
                    method: 'GET',

                })
                if (response.status === 200) {
                    console.log('response',)
                    console.log('length', await response.length)
                    let order = (await response.json()).cartLineList
                    await loading.setCount(order.length)
                    await setOrders(order)
                }
                alert("Xin ch??o Kh??ch h??ng");

            } else if (_user && _user.authorities[0].authority === ROLE_ENUM.STAFF) {
                alert("Xin ch??o Nh??n Vi??n")
            } else if (_user && _user.authorities[0].authority === ROLE_ENUM.ADMIN) {
                alert("Xin ch??o Admin")
                return navigate('/admin')
            }
            handleClose()

        }

    }


    async function handle_Logout() {
        // L??u ?? n??n navigate tr?????c, sau ???? m???i d???n d???p localStorage, n???u kh??ng s??? b??? l???i truy su???t null
        navigate('/')
        alert("????ng xu???t th??nh c??ng")
        await loading.setUser(null)
        await loading.setJwt('')
        await loading.setDisplayName('')
        await loading.setCount(0)
        window.localStorage.clear()
    }
    return (
        <Container>

            {loading.displayName ?
                <>
                    <DropdownButton
                        variant="outline-secondary"
                        title={loading.displayName}
                        id="input-group-dropdown-2"
                        align="end"
                    >
                        <Dropdown.Item href="#">Account</Dropdown.Item>
                        <Dropdown.Item href="#">My Coupons</Dropdown.Item>
                        <Dropdown.Item href="#">History invoices</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => handle_Logout()}>Logout</Dropdown.Item>
                    </DropdownButton>
                </>
                :
                <>
                    <PersonIcon onClick={handleShow} />
                </>}
            <Offcanvas show={show} onHide={handleClose} placement='center' >
                <Offcanvas.Header closeButton>
                    <Offcanvas.Title className='fs-2 fw-bold align-self-center'>Login</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Text className="text-muted ">
                                H??y ????ng nh???p ????? tr???i nghi???m nh???ng d???ch v??? tuy???t v???i c???a ch??ng t??i
                            </Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBasicEmail">
                            <Form.Label className='fw-bold'>?????a ch??? Email</Form.Label>
                            <Form.Control type="text" placeholder="Enter email" onChange={(event) => setUsername(event.target.value)} />

                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formBasicPassword">
                            <Form.Label className='fw-bold'>M???t kh???u</Form.Label>
                            <Form.Control type="password" placeholder="Password" onChange={(event) => setPassword(event.target.value)} />
                            <Form.Text className="text-muted">
                                Ch??ng t??i s??? kh??ng ti???t l??? th??ng tin c?? nh??n c???a b???n.
                            </Form.Text>
                        </Form.Group>
                        {errorMsg ? (
                            <Row className="justify-content-center mb-4">
                                <Col md="8" lg="6">
                                    <div className="" style={{ color: "red", fontWeight: "bold" }}>
                                        {errorMsg}
                                    </div>
                                </Col>
                            </Row>
                        ) : (
                            <></>
                        )}

                        <Form.Group className="mb-3" controlId="formBasicCheckbox">
                            <Button
                                id="submit"
                                type="button"
                                className='button_login'
                                onClick={sendLoginRequest}

                            >
                                Login
                            </Button>
                            <div className='link_login'>
                                <a href='/register'>????ng K??</a>
                                <a href='/forget'>Qu??n m???t kh???u?</a>
                            </div>

                        </Form.Group>
                    </Form>
                </Offcanvas.Body>
            </Offcanvas>
        </Container>
    )
}

