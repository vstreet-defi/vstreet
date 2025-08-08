import LoanInfoHeader from '../../../components/atoms/Loan-Info-Header/LoanInfoHeader';
import LoanInfoCard from '../../../components/molecules/Loan-Info-Card/LoanInfoCard';
import { BorrowCard } from '../../../components/molecules/Borrow-Card/BorrowCard';
import { BorrowCardSignless } from '@/components/signless/BorrowCardSignless';


function LoanInfo() {
  return (
    <div style={{}}>
      
      <LoanInfoHeader />
      <LoanInfoCard />
      <BorrowCardSignless />
    </div>
  );
}

export default LoanInfo;
