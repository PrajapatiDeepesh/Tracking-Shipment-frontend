import React, { useState, useRef, useEffect } from 'react';  
import { Container, Row, Col, Form, Button, ProgressBar, Nav } from 'react-bootstrap';
import { v4 as uuidv4 } from 'uuid';
import JsBarcode from 'jsbarcode';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import axios from 'axios'; 
import { FaSearch, FaBell, FaCheckCircle, FaShippingFast, FaHome, FaUser, FaInfoCircle, FaEnvelope, FaCog } from 'react-icons/fa';

function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    senderName: '',
    senderAddress: '',
    receiverName: '',
    receiverAddress: '',
    shipmentDetails: '',
    trackId: uuidv4(), // Generate a unique tracking ID
  });

  const barcodeRef = useRef(null);

  useEffect(() => {
    if (barcodeRef.current && formData.trackId) {
      JsBarcode(barcodeRef.current, formData.trackId, {
        format: 'CODE128',
        displayValue: true,
        width: 2,
        height: 40,
        margin: 10,
      });
    }
  }, [formData.trackId, step]);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = () => {
    axios.get('http://localhost:5000/api/shipments')
      .then(response => {
        console.log('Fetched shipments:', response.data);
      })
      .catch(error => console.error(error));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handlePrev = () => {
    setStep(step - 1);
  };

  const handleDownloadBarcode = (format) => {
    if (barcodeRef.current) {
      if (format === 'png') {
        toPng(barcodeRef.current).then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'barcode.png';
          link.href = dataUrl;
          link.click();
        });
      } else if (format === 'pdf') {
        toPng(barcodeRef.current).then((dataUrl) => {
          const pdf = new jsPDF();
          pdf.addImage(dataUrl, 'PNG', 10, 10, 180, 60);
          pdf.save('barcode.pdf');
        });
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post('http://localhost:5000/api/shipments', formData)
      .then(response => {
        alert('Form submitted!');
        setFormData({
          senderName: '',
          senderAddress: '',
          receiverName: '',
          receiverAddress: '',
          shipmentDetails: '',
          trackId: uuidv4(), // Generate a new unique tracking ID
        });
        setStep(1); // Reset to the first step
      })
      .catch(error => console.error(error));
  };

  const getProgressBarNow = () => {
    switch (step) {
      case 1: return 25;
      case 2: return 50;
      case 3: return 75;
      case 4: return 100;
      default: return 0;
    }
  };

  return (
    <div>
      {/* Custom Navbar */}
      <div className="custom-navbar">
        <FaShippingFast className="navbar-icon shipment-icon" />
        <div className="navbar-icons">
          <FaSearch className="navbar-icon" />
          <FaBell className="navbar-icon" />
          <FaCheckCircle className="navbar-icon active-icon" />
        </div>
      </div>

      <Container fluid>
        <Row>
          {/* Left Sidebar */}
          <Col md={2} className="bg-light">
            <Nav className="flex-column">
              <Nav.Link href="#home" className="sidebar-item">
                <FaHome style={{ color: '#007bff', marginRight: '10px' }} />
                Home
              </Nav.Link>
              <Nav.Link href="#profile" className="sidebar-item">
                <FaUser style={{ color: '#28a745', marginRight: '10px' }} />
                Profile
              </Nav.Link>
              <Nav.Link href="#about" className="sidebar-item">
                <FaInfoCircle style={{ color: '#17a2b8', marginRight: '10px' }} />
                About
              </Nav.Link>
              <Nav.Link href="#contact" className="sidebar-item">
                <FaEnvelope style={{ color: '#ffc107', marginRight: '10px' }} />
                Contact
              </Nav.Link>
              <Nav.Link href="#settings" className="sidebar-item">
                <FaCog style={{ color: '#dc3545', marginRight: '10px' }} />
                Settings
              </Nav.Link>
            </Nav>
          </Col>

          {/* Center Form */}
          <Col md={8}>
            <h2>Shipment Form</h2>
            <Form onSubmit={handleSubmit}>
              {step === 1 && (
                <>
                  <Form.Group controlId="senderName">
                    <Form.Label>Sender Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="senderName"
                      value={formData.senderName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="senderAddress">
                    <Form.Label>Sender Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="senderAddress"
                      value={formData.senderAddress}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Form.Group controlId="receiverName">
                    <Form.Label>Receiver Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="receiverName"
                      value={formData.receiverName}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Form.Group controlId="receiverAddress">
                    <Form.Label>Receiver Address</Form.Label>
                    <Form.Control
                      type="text"
                      name="receiverAddress"
                      value={formData.receiverAddress}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="secondary" onClick={handlePrev}>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                </>
              )}

              {step === 3 && (
                <>
                  <Form.Group controlId="shipmentDetails">
                    <Form.Label>Shipment Details</Form.Label>
                    <Form.Control
                      type="text"
                      name="shipmentDetails"
                      value={formData.shipmentDetails}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                  <Button variant="secondary" onClick={handlePrev}>
                    Previous
                  </Button>
                  <Button variant="primary" onClick={handleNext}>
                    Next
                  </Button>
                </>
              )}

              {step === 4 && (
                <>
                  <Form.Group controlId="trackId">
                    <Form.Label>Tracking ID</Form.Label>
                    <Form.Control
                      type="text"
                      name="trackId"
                      value={formData.trackId}
                      readOnly
                    />
                  </Form.Group>
                  <div>
                    <svg ref={barcodeRef}></svg>
                  </div>
                  <Button variant="secondary" onClick={handlePrev}>
                    Previous
                  </Button>
                  <Button variant="primary" type="submit">
                    Submit
                  </Button>
                  <Button variant="success" onClick={() => handleDownloadBarcode('png')}>
                    Download Barcode as PNG
                  </Button>
                  <Button variant="success" onClick={() => handleDownloadBarcode('pdf')}>
                    Download Barcode as PDF
                  </Button>
                </>
              )}
            </Form>
          </Col>

          {/* Right Progress Sidebar */}
          <Col md={2} className="bg-light">
            <h4>Progress Status</h4>
            <ProgressBar now={getProgressBarNow()} className="progress-bar" />
            <ul className="progress-list">
              <li className={step === 1 ? 'active' : ''}>Send</li>
              <li className={step === 2 ? 'active' : ''}>Receive</li>
              <li className={step === 3 ? 'active' : ''}>Shipment</li>
              <li className={step === 4 ? 'active' : ''}>Tracking ID</li>
            </ul>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
