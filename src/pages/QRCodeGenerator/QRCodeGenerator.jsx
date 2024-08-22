import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { Search, Download } from 'react-bootstrap-icons';
import QRCodeLib from 'qrcode';
import tokenService from '../../Api/tokenService';
import './qr.css';
import { useTranslation } from 'react-i18next';
import { Spinner } from 'react-bootstrap';
const QRCodeGenerator = () => {
  const { t } = useTranslation();
  const [tableCount, setTableCount] = useState(null);
  const [qrCodes, setQrCodes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const itemsPerPage = 5;
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    tokenService.getWebsiteUrl()
      .then(url => setWebsiteUrl(url))
      .catch(error => console.error('Error fetching website URL:', error));
  }, []);

  const handleInputChange = (event) => {
    setTableCount(Number(event.target.value));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const generateTokens = async () => {
    if (!websiteUrl) {
      
      console.error('Website URL has not been fetched.');
      
      return;
    }
    setIsLoading(true);
    const tempQrCodes = [];
    for (let tableNumber = 1; tableNumber <= tableCount; tableNumber++) {
      try {
        const token = await tokenService.generateToken(tableNumber);
        const qrCodeUrl = `${websiteUrl}?token=${token}`;
        tempQrCodes.push({ tableNumber, qrCodeUrl });
      } catch (error) {
        console.error(`Error generating token for table ${tableNumber}`, error);
      }
    }
    setIsLoading(false);
    setQrCodes(tempQrCodes);
  };

  const downloadQRCode = (tableNumber, qrCodeUrl) => {
    const canvas = canvasRef.current;
    const size = 1000; // Size of the QR code for good quality
    canvas.width = size;
    canvas.height = size;
    QRCodeLib.toCanvas(canvas, qrCodeUrl, { width: size, margin: 1 }, (error) => {
      if (error) console.error(error);

      // Create the downloaded image
      const pngUrl = canvas
        .toDataURL('image/png')
        .replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = `QRCode_Table_${tableNumber}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  };

  const filteredQrCodes = qrCodes.filter(({ tableNumber }) =>
    tableNumber.toString().includes(searchTerm)
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQrCodes = filteredQrCodes.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="content mt-5">
      <div className="page-header">
        <div className="page-title">
          <h4>{t('qrCodeGenerator.title')}</h4>
          <h6>{t('qrCodeGenerator.subtitle')}</h6>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-center mb-4">
            <input
              type="number"
              value={tableCount}
              onChange={handleInputChange}
              placeholder={t('qrCodeGenerator.inputPlaceholder')}
              className="form-control w-25"
            />
            <button onClick={generateTokens} className="btn btn-primary ms-2" disabled={isLoading}>
            {isLoading ? (
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  ) : (
              t('qrCodeGenerator.generateButton')
            )}
              </button>
          </div>

          {qrCodes.length > 0 && (
            <>
              <div className="table-top mb-3">
                <div className="search-set">
                  <div className="search-container">
                    <Search className="search-icon" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={handleSearchChange}
                      placeholder={t('qrCodeGenerator.searchPlaceholder')}
                      className="form-control search-input"
                      aria-label={t('qrCodeGenerator.searchAriaLabel')}
                    />
                  </div>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover table-striped table-bordered datanew">
                  <thead className="thead-custom">
                    <tr>
                      <th>{t('qrCodeGenerator.tableNumber')}</th>
                      <th>{t('qrCodeGenerator.qrCode')}</th>
                      <th>{t('qrCodeGenerator.downloadQRCode')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentQrCodes.map(({ tableNumber, qrCodeUrl }) => (
                      <tr key={tableNumber}>
                        <td>{tableNumber}</td>
                        <td>
                          <div id={`qrCodeCanvas${tableNumber}`} className="qr-container">
                            <QRCode value={qrCodeUrl} size={100} />
                          </div>
                          
                        </td>
                        <td>
                          <button onClick={() => downloadQRCode(tableNumber, qrCodeUrl)} className="btn btn-secondary">
                            <Download />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredQrCodes.length > itemsPerPage && (
                <nav>
                  <ul className="pagination justify-content-center">
                    {Array.from({ length: Math.ceil(filteredQrCodes.length / itemsPerPage) }, (_, i) => (
                      <li key={i + 1} className={`page-item ${i + 1 === currentPage ? 'active' : ''}`}>
                        <button onClick={() => paginate(i + 1)} className="page-link">
                          {i + 1}
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
            </>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default QRCodeGenerator;