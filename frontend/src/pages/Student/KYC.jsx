import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Save, CheckCircle, Upload, Landmark, ShieldCheck, XCircle } from 'lucide-react';
import api from '../../utils/api';

export default function KYC() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [upi, setUpi] = useState('');
  const [idProofFile, setIdProofFile] = useState(null);
  const [bankProofFile, setBankProofFile] = useState(null);
  const [idProofUrl, setIdProofUrl] = useState(null);
  const [bankProofUrl, setBankProofUrl] = useState(null);
  const [adminNote, setAdminNote] = useState('');

  const [status, setStatus] = useState('not_submitted'); // pending | approved | rejected | not_submitted
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchKYCStatus = async () => {
      try {
        const response = await api.get('/student/kyc');
        if (response.data.kyc) {
          const kyc = response.data.kyc;
          setFullName(kyc.full_name || '');
          setAadhaar(kyc.aadhaar_number || '');
          setPan(kyc.pan_number || '');
          setBankName(kyc.bank_name || '');
          setAccountNumber(kyc.account_number || '');
          setIfsc(kyc.ifsc_code || '');
          setUpi(kyc.upi_id || '');
          setStatus(kyc.status || 'not_submitted');
          setIdProofUrl(kyc.id_proof_url || null);
          setBankProofUrl(kyc.bank_proof_url || null);
          setAdminNote(kyc.admin_note || '');
        }
      } catch (err) {
        console.error('Error fetching KYC', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKYCStatus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    try {
      const formData = new FormData();
      formData.append('full_name', fullName);
      formData.append('aadhaar_number', aadhaar);
      formData.append('pan_number', pan);
      formData.append('bank_name', bankName);
      formData.append('account_number', accountNumber);
      formData.append('ifsc_code', ifsc);
      formData.append('upi_id', upi);
      if (idProofFile) formData.append('id_proof', idProofFile);
      if (bankProofFile) formData.append('bank_proof', bankProofFile);

      const response = await api.post('/student/kyc', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response.data.success) {
        setSuccess(true);
        setStatus('pending');
      } else {
        setError(response.data.message || 'Submission failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC data.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2">KYC Verification</h1>
        <p className="text-slate-500">Provide bank information and identification to approve wallet payouts.</p>
      </div>

      {status === 'approved' && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-6 rounded-2xl mb-8 flex items-center gap-4">
          <ShieldCheck className="w-10 h-10 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold text-lg">KYC Approved</h4>
            <p className="text-sm text-emerald-700/80">Your profile is fully verified. Payouts will process directly to your registered UPI or Bank account.</p>
          </div>
        </div>
      )}

      {status === 'pending' && (
        <div className="bg-orange-50 border border-orange-200 text-orange-800 p-6 rounded-2xl mb-8 flex items-center gap-4">
          <FileText className="w-10 h-10 text-orange-600 shrink-0" />
          <div>
            <h4 className="font-bold text-lg">Verification Pending</h4>
            <p className="text-sm text-orange-700/80">Your details are currently being reviewed by our compliance team. Changes are locked during review.</p>
          </div>
        </div>
      )}

      {status === 'rejected' && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl mb-8 flex items-center gap-4">
          <XCircle className="w-10 h-10 text-red-600 shrink-0" />
          <div>
            <h4 className="font-bold text-lg">Verification Failed</h4>
            <p className="text-sm text-red-700/80">Your KYC was rejected. Reason: <strong>{adminNote || 'No reason provided'}</strong>. Please correct and re-submit.</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm mb-6">
          KYC submitted successfully!
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 bg-white border border-slate-100 p-8 rounded-3xl shadow-sm">
        {/* Bank Details */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
            <Landmark className="w-5 h-5 text-primary" /> Bank Account & UPI
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              disabled={status === 'pending' || status === 'approved'}
              placeholder="Bank Name (e.g. HDFC)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary disabled:bg-slate-50"
            />
            <input
              type="text"
              required
              disabled={status === 'pending' || status === 'approved'}
              placeholder="Account Number"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary disabled:bg-slate-50"
            />
            <input
              type="text"
              required
              disabled={status === 'pending' || status === 'approved'}
              placeholder="IFSC Code"
              value={ifsc}
              onChange={(e) => setIfsc(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary disabled:bg-slate-50"
            />
            <input
              type="text"
              disabled={status === 'pending' || status === 'approved'}
              placeholder="UPI ID (e.g. mobile@ybl)"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Identity Details */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
            <FileText className="w-5 h-5 text-primary" /> Identity Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              required
              disabled={status === 'pending' || status === 'approved'}
              placeholder="Full Name (As on Aadhaar)"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary disabled:bg-slate-50"
            />
            <input
              type="text"
              required
              disabled={status === 'pending' || status === 'approved'}
              placeholder="Aadhaar Card Number"
              value={aadhaar}
              onChange={(e) => setAadhaar(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary disabled:bg-slate-50"
            />
            <input
              type="text"
              required
              disabled={status === 'pending' || status === 'approved'}
              placeholder="PAN Card Number"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              className="p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary col-span-1 md:col-span-2 disabled:bg-slate-50"
            />
          </div>
        </div>

        {/* Document Uploads */}
        <div>
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2 border-b pb-2">
            <Upload className="w-5 h-5 text-primary" /> Document Uploads
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">ID Proof (Aadhaar/PAN Front)</label>
              {idProofUrl && (
                <img src={idProofUrl} alt="ID Proof" className="w-full h-32 object-cover rounded-xl mb-2 border border-slate-200" />
              )}
              {status !== 'pending' && status !== 'approved' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setIdProofFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-bold"
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Bank Proof (Cheque/Passbook)</label>
              {bankProofUrl && (
                <img src={bankProofUrl} alt="Bank Proof" className="w-full h-32 object-cover rounded-xl mb-2 border border-slate-200" />
              )}
              {status !== 'pending' && status !== 'approved' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setBankProofFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary/10 file:text-primary file:font-bold"
                />
              )}
            </div>
          </div>
        </div>

        {status !== 'pending' && status !== 'approved' && (
          <button type="submit" className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            <Save className="w-5 h-5" /> Submit KYC Information
          </button>
        )}
      </form>
    </div>
  );
}
