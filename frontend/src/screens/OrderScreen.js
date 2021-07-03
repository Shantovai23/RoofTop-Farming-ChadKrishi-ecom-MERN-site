/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState,} from "react";
import axios from 'axios'
import { Row, Col, ListGroup, Image, Card } from "react-bootstrap";
import { PayPalButton } from 'react-paypal-button-v2'
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import Message from "../components/Message";
import { getOrderDetails, payOrder } from "../actions/orderActions";
import Loader from "../components/Loader";
import {ORDER_PAY_RESET} from '../constant/orderConstants'

const OrderScreen = ({ match }) => {
  const orderId=match.params.id
  const dispatch = useDispatch();

  const [sdkReady, setSdkReady] = useState(false)
 
  const orderDetail = useSelector((state) => state.orderDetails);
  const { order, loading, error } = orderDetail;

  const orderPay = useSelector((state) => state.orderPay)
  const { loading: loadingPay, success: successPay } = orderPay

  if(!loading){
    order.itemsPrice = order.orderItems.reduce(
        (flag, item) => flag + item.price * item.qty,
        0
      );
      order.shippingPrice = order.itemsPrice > 200 ? 0 : 50;
  }
 
  console.log({order})

  useEffect(() => {
    const addPayPalScript = async () => {
    const { data: clientId } = await axios.get('/api/config/paypal')
    const script = document.createElement('script')
      script.type = 'text/javascript'
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`
      script.async = true
      script.onload = () => {
        setSdkReady(true)
      }
      document.body.appendChild(script)
    }

   if(!order || successPay){
     dispatch({type:ORDER_PAY_RESET})
    dispatch(getOrderDetails(orderId))
   }else if (!order.isPaid) {
    if (!window.paypal) {
      addPayPalScript()
    } else {
      setSdkReady(true)
    }
   }
  }, [dispatch,orderId,order,successPay]);


  const successPaymentHandler=(paymentResult)=>{
    console.log('pay',paymentResult)
    dispatch(payOrder(orderId, paymentResult))
  }



  return loading ? <Loader/> : error ? <Message variant='danger'>{error}</Message> : <>
      <h2>Order : {order._id}</h2>
      <Row>
        <Col md={8}>
          <ListGroup variant="flush">
            <ListGroup.Item>
              <h4>Shipping</h4>
              <strong>Name : </strong> {order.user.name}
             <p><strong>Email :</strong> <a href={`mailto:${order.user.email}`}>{order.user.email}</a></p>
              <p>
                <strong>Address:</strong>
                {order.shippingAddress.address}, {order.shippingAddress.city},
                {order.shippingAddress.postalCode},
                {order.shippingAddress.country}
              </p>
              {order.isDelivered? (<Message variant='success'>Delivered on {order.deliveredAt}</Message>) : (<Message variant='danger'>Not Delivered</Message>)}
            </ListGroup.Item>

            <ListGroup.Item>
              <h4>Payment Method</h4>
              <p>
                <strong>Method:</strong>
                {order.paymentMethod}
              </p>
              {order.isPaid? (<Message variant='success'>Pain on {order.paidAt}</Message>) : (<Message variant='danger'>Not Paid</Message>)}
            </ListGroup.Item>

            <ListGroup.Item>
              <h4>Order Items</h4>
              <p>
                {order.orderItems.length === 0 ? (
                  <Message>Order is Empty</Message>
                ) : (
                  <ListGroup variant="flush">
                    {order.orderItems.map((item, index) => (
                      <ListGroup.Item key={index}>
                        <Row>
                          <Col md={1}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                            />
                          </Col>

                          <Col>
                            <Link to={`/product/${item.product}`}>
                              {item.name}
                            </Link>
                          </Col>

                          <Col md={4}>
                            {item.qty} x ${item.price} = {item.qty * item.price}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </p>
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h4>Order Summery</h4>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>${order.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping</Col>
                  <Col>${order.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Tax</Col>
                  <Col>${order.taxPrice}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total</Col>
                  <Col>${order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>

              {!order.isPaid && (
                <ListGroup.Item>
                  {loadingPay && <Loader />}
                  {!sdkReady ? (
                    <Loader />
                  ) : (
                    <PayPalButton
                      amount={order.totalPrice}
                      onSuccess={successPaymentHandler}
                    />
                  )}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
  </>
};

export default OrderScreen;