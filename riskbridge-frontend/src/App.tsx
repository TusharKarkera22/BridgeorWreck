import { useState, useEffect } from 'react';
import { useAccount, useBalance, useWriteContract, useWaitForTransactionReceipt, useReadContract, useWatchContractEvent } from 'wagmi';
import { parseUnits, formatUnits, parseEther, formatEther } from 'viem';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Trophy, TrendingUp, TrendingDown, Zap, Target, Award, Flame, Wallet, ArrowUpDown } from 'lucide-react';
import { CrossChainBridge } from './components/CrossChainBridge';
import { SolanaWalletProvider } from './components/SolanaWalletProvider';
import { BRIDGE_ADDRESS, BRIDGE_ABI, USDC_ADDRESS } from './contracts/RiskBridge';
import './App.css';

function App() {
  const { address, isConnected } = useAccount();
  const [leveragePercent, setLeveragePercent] = useState(50);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [betResults, setBetResults] = useState<any[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [userXP, setUserXP] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [totalBets, setTotalBets] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [showCrossChainModal, setShowCrossChainModal] = useState(false);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });
  
  // Separate contract write hooks for different operations
  const { writeContract: writeApproval, data: approvalHash, isPending: isApproving } = useWriteContract();
  const { isSuccess: isApprovalConfirmed } = useWaitForTransactionReceipt({ hash: approvalHash });
  
  // Loading states for different operations
  const [isDepositing, setIsDepositing] = useState(false);
  const [isBetting, setIsBetting] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Get user's USDC balance
  const { data: usdcBalance } = useBalance({
    address: address,
    token: USDC_ADDRESS,
  });

  // Get user's ETH balance for gas
  const { data: ethBalance } = useBalance({
    address: address,
  });

  // Read user's USDC allowance for the contract
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: [
      {
        "inputs": [
          {"internalType": "address", "name": "owner", "type": "address"},
          {"internalType": "address", "name": "spender", "type": "address"}
        ],
        "name": "allowance",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ],
    functionName: 'allowance',
    args: address ? [address, BRIDGE_ADDRESS] : undefined,
    query: { enabled: !!address }
  });

  // Read user balance
  const { data: userBalance, refetch: refetchBalance } = useReadContract({
    address: BRIDGE_ADDRESS,
    abi: BRIDGE_ABI,
    functionName: 'getUserBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Read user bet status
  const { data: betStatus, refetch: refetchBetStatus } = useReadContract({
    address: BRIDGE_ADDRESS,
    abi: BRIDGE_ABI,
    functionName: 'getUserBetStatus',
    args: address ? [address] : undefined,
    query: { enabled: !!address }
  });

  // Watch for BetResolved events
  useWatchContractEvent({
    address: BRIDGE_ADDRESS,
    abi: BRIDGE_ABI,
    eventName: 'BetResolved',
    onLogs(logs) {
      logs.forEach((log) => {
        const { user, won, amount, leveragePercent } = log.args as {
          user: string;
          won: boolean;
          amount: bigint;
          leveragePercent: bigint;
        };
        
        const newResult = {
          id: log.transactionHash || Math.random().toString(),
          user,
          won,
          amount: formatUnits(amount, 6),
          leveragePercent: Number(leveragePercent),
          timestamp: Date.now()
        };
        
        setBetResults(prev => [newResult, ...prev.slice(0, 9)]);
      });
    }
  });

  // Calculate user stats
  const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
  const xpProgress = (userXP % 1000) / 10;
  const balance = userBalance ? formatUnits(userBalance as bigint, 6) : '0';
  const hasPendingBet = betStatus ? (betStatus as any)[0] : false;
  const pendingLeverage = betStatus ? Number((betStatus as any)[2]) : 0;

  // Achievement system
  const checkAchievements = () => {
    const newAchievements: string[] = [];
    
    if (totalBets >= 10 && !achievements.includes('First Steps')) {
      newAchievements.push('First Steps');
    }
    if (winStreak >= 5 && !achievements.includes('Hot Streak')) {
      newAchievements.push('Hot Streak');
    }
    if (winRate >= 70 && totalBets >= 20 && !achievements.includes('Lucky Charm')) {
      newAchievements.push('Lucky Charm');
    }
    if (totalBets >= 100 && !achievements.includes('High Roller')) {
      newAchievements.push('High Roller');
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  // Update stats when bet results change
  useEffect(() => {
    if (betResults.length > 0) {
      const wins = betResults.filter(result => result.won).length;
      setTotalBets(betResults.length);
      setTotalWins(wins);
      
      // Calculate streak
      let streak = 0;
      for (let i = betResults.length - 1; i >= 0; i--) {
        if (betResults[i].won) {
          streak++;
        } else {
          break;
        }
      }
      setWinStreak(streak);
      
      // Update XP and level
      const newXP = betResults.length * 100 + wins * 50;
      setUserXP(newXP);
      setUserLevel(Math.floor(newXP / 1000) + 1);
      
      checkAchievements();
    }
  }, [betResults, achievements, totalBets, winRate, winStreak]);

  useEffect(() => {
    if (isConfirmed || isApprovalConfirmed) {
      refetchBalance();
      refetchBetStatus();
      refetchAllowance();
      setIsDepositing(false);
      setIsBetting(false);
      setIsWithdrawing(false);
      setErrorMessage('');
    }
  }, [isConfirmed, isApprovalConfirmed, refetchBalance, refetchBetStatus, refetchAllowance]);

  const handleApproveUSDC = async () => {
    if (!depositAmount) return;
    
    try {
      setErrorMessage('');
      const amountInWei = parseUnits(depositAmount, 6);
      
      writeApproval({
        address: USDC_ADDRESS,
        abi: [
          {
            "inputs": [
              {"internalType": "address", "name": "spender", "type": "address"},
              {"internalType": "uint256", "name": "amount", "type": "uint256"}
            ],
            "name": "approve",
            "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
            "stateMutability": "nonpayable",
            "type": "function"
          }
        ],
        functionName: 'approve',
        args: [BRIDGE_ADDRESS, amountInWei],
      });
    } catch (error) {
      console.error('Approval error:', error);
      setErrorMessage('Failed to approve USDC. Please try again.');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount) return;
    
    try {
      setErrorMessage('');
      setIsDepositing(true);
      const amountInWei = parseUnits(depositAmount, 6);
      
      // Check if approval is needed
      const currentAllowance = usdcAllowance as bigint || 0n;
      if (currentAllowance < amountInWei) {
        setNeedsApproval(true);
        setIsDepositing(false);
        return;
      }
      
      writeContract({
        address: BRIDGE_ADDRESS,
      abi: BRIDGE_ABI,
        functionName: 'deposit',
        args: [amountInWei],
      });
    } catch (error) {
      console.error('Deposit error:', error);
      setErrorMessage('Failed to deposit. Please try again.');
      setIsDepositing(false);
    }
  };

  const handlePlaceBet = async () => {
    if (!userBalance || userBalance === 0n) {
      setErrorMessage('No balance available for betting');
      return;
    }
    
    // Check if user has enough ETH for the entropy fee
    const ethBalanceValue = ethBalance?.value || 0n;
    const requiredFee = parseEther('0.001');
    
    if (ethBalanceValue < requiredFee) {
      setErrorMessage('Insufficient ETH for entropy fee (0.001 ETH required)');
      return;
    }
    
    try {
      setErrorMessage('');
      setIsBetting(true);
      
      writeContract({
        address: BRIDGE_ADDRESS,
      abi: BRIDGE_ABI,
        functionName: 'placeBet',
        args: [BigInt(leveragePercent)],
        value: requiredFee,
      });
    } catch (error) {
      console.error('Bet error:', error);
      setErrorMessage('Failed to place bet. Please try again.');
      setIsBetting(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount) {
      setErrorMessage('Please enter a withdrawal amount');
      return;
    }
    
    const withdrawAmountBigInt = parseUnits(withdrawAmount, 6);
    const currentBalance = userBalance as bigint || 0n;
    
    if (withdrawAmountBigInt > currentBalance) {
      setErrorMessage('Withdrawal amount exceeds available balance');
      return;
    }
    
    try {
      setErrorMessage('');
      setIsWithdrawing(true);
      
      writeContract({
        address: BRIDGE_ADDRESS,
      abi: BRIDGE_ABI,
        functionName: 'withdraw',
        args: [withdrawAmountBigInt]
      });
    } catch (error) {
      console.error('Withdraw failed:', error);
      setErrorMessage('Failed to withdraw. Please try again.');
      setIsWithdrawing(false);
    }
  };

  // Create particles effect
  const createParticles = () => {
    const particles = [];
    for (let i = 0; i < 50; i++) {
      particles.push(
        <div
          key={i}
          className="particle"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 6}s`,
            animationDuration: `${6 + Math.random() * 4}s`
          }}
        />
      );
    }
    return particles;
  };

  return (
    <div className="app-container">
      {/* Fixed Top Header with Wallet */}
      <div className="top-header">
        <div className="logo-section">
          <span className="logo-text">🎰 BRIDGE</span>
        </div>
        <div className="wallet-section">
          <ConnectButton />
        </div>
      </div>

      {/* Animated Background */}
      <div className="game-background"></div>
      
      {/* Particle System */}
      <div className="particles">
        {createParticles()}
      </div>
      
      {/* Main Content */}
      <div className="content-container">
        {/* Header */}
        <div className="header-section">
          <h1 className="main-title text-glow neon-glow" style={{ 
            background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Bridge or Wreck
          </h1>
          <p className="subtitle">
            Cross-chain betting with style and rewards
          </p>
        </div>

        {!isConnected ? (
          <div className="wallet-prompt">
            <div className="wallet-card">
              <Wallet className="wallet-icon pulse" />
              <h2 className="wallet-title text-glow">
                Connect Your Wallet
              </h2>
              <p className="wallet-description">
                Connect your wallet to start betting on Bridge
              </p>
            </div>
          </div>
        ) : (
          <div className="main-layout">
            {/* Left Section */}
            <div className="left-section">
              {/* User Stats Dashboard */}
              {address && (
                <div className="stats-dashboard">
                  <div className="stats-grid">
                    {/* Level Indicator */}
                    <div className="level-indicator">
                      <Trophy className="trophy-icon" size={20} />
                      <span>Level</span>
                      <div className="level-badge">{userLevel}</div>
                    </div>
                    
                    {/* Win Streak */}
                    <div className="streak-counter">
                      <Flame className="streak-flame" size={20} />
                      <span>Streak: {winStreak}</span>
                    </div>
                    
                    {/* Win Rate */}
                    <div className="stat-item win-rate">
                      <Target size={20} />
                      <span>Win Rate: {winRate.toFixed(1)}%</span>
                    </div>
                    
                    {/* Total Bets */}
                    <div className="stat-item total-bets">
                      <Zap size={20} />
                      <span>Bets: {totalBets}</span>
                    </div>
                  </div>
                  
                  {/* XP Progress Bar */}
                  <div className="xp-section">
                    <div className="xp-header">
                      <span>XP Progress</span>
                      <span>{userXP % 1000} / 1000</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${xpProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Achievements */}
                  {achievements.length > 0 && (
                    <div className="achievements-section">
                      {achievements.map((achievement, index) => (
                        <div key={index} className="achievement-badge">
                          <Award size={14} className="mr-1" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Balance Card */}
              <div className="balance-card">
                <div className="card-header">
                  <h3 className="card-title text-glow">Your Balance</h3>
                  <TrendingUp className="card-icon neon-glow" />
                </div>
                <div className="balance-content">
                  <div className="balance-main">
                    <span className="balance-label">Contract Balance:</span>
                    <span className="balance-amount text-glow">{balance} USDC</span>
                  </div>
                  
                  {/* Progress Bar for Balance */}
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.min((parseFloat(balance) / 1000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="balance-details">
                    <div className="balance-item">
                      <div className="balance-item-label">USDC Balance</div>
                      <div className="balance-item-value">
                        {usdcBalance ? formatUnits(usdcBalance.value, 6) : '0'} USDC
                      </div>
                    </div>
                    <div className="balance-item">
                      <div className="balance-item-label">ETH for Gas</div>
                      <div className="balance-item-value">
                        {ethBalance ? formatEther(ethBalance.value) : '0'} ETH
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section */}
            <div className="right-section">
              {/* Deposit Card */}
              <div className="deposit-card">
                <h3 className="card-title text-glow">💰 Deposit USDC 💰</h3>
                <div className="deposit-content">
                  <input
                    type="number"
                    placeholder="Amount in USDC"
                    value={depositAmount}
                    onChange={(e) => {
                      setDepositAmount(e.target.value);
                      setNeedsApproval(false);
                      setErrorMessage('');
                    }}
                    className="game-input"
                    step="0.000001"
                    min="0"
                  />
                  
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="error-message">
                      ⚠️ {errorMessage}
                    </div>
                  )}
                  
                  {/* Approval needed */}
                  {needsApproval ? (
                    <button
                      onClick={handleApproveUSDC}
                      disabled={!depositAmount || isApproving}
                      className="game-button warning full-width"
                    >
                      {isApproving ? (
                        <div className="button-loading">
                          <div className="loading-spinner"></div>
                          Approving USDC...
                        </div>
                      ) : (
                        '✅ Approve USDC First'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={handleDeposit}
                      disabled={!depositAmount || isDepositing}
                      className="game-button primary full-width"
                    >
                      {isDepositing ? (
                        <div className="button-loading">
                          <div className="loading-spinner"></div>
                          Depositing...
                        </div>
                      ) : (
                        '💰 Deposit USDC 💰'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Betting Card */}
              <div className="betting-card">
                <h3 className="card-title text-glow">🎲 Place Your Bet 🎲</h3>
                <div className="betting-content">
                  <div className="leverage-section">
                    <label className="leverage-label">
                      Leverage: {leveragePercent}%
                    </label>
                    <input
                      type="range"
                      min="5"
                      max="25"
                      value={leveragePercent}
                      onChange={(e) => setLeveragePercent(Number(e.target.value))}
                      className="game-slider"
                    />
                    <div className="risk-indicators">
                      <span className="risk-low">🛡️ Safe</span>
                      <span className="risk-medium">⚡ Medium</span>
                      <span className="risk-high">🔥 High Risk</span>
                    </div>
                  </div>
                  
                  <div className="bet-amount-display">
                    <div className="bet-amount-row">
                      <span className="bet-amount-label">Bet Amount:</span>
                      <span className="bet-amount-value text-glow">
                        {balance && parseFloat(balance) > 0 
                          ? (parseFloat(balance) * leveragePercent / 100).toFixed(6)
                          : '0'} USDC
                      </span>
                    </div>
                  </div>

                  {/* Error Message */}
                  {errorMessage && (
                    <div className="error-message">
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  {hasPendingBet ? (
                    <div className="pending-bet">
                      <div className="loading-spinner"></div>
                      <p className="pending-text">
                        🎲 Bet pending... Leverage: {pendingLeverage}% 🎲
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handlePlaceBet}
                      disabled={!userBalance || userBalance === 0n || isBetting}
                      className="game-button success full-width coin-flip sound-bet"
                    >
                      {isBetting ? (
                        <div className="button-loading">
                          <div className="loading-spinner"></div>
                          Rolling the dice...
                        </div>
                      ) : (
                        '🎰 PLACE BET (0.001 ETH fee) 🎰'
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Withdraw Card */}
              <div className="withdraw-card">
                <h3 className="card-title text-glow">💰 Withdraw 💰</h3>
                <div className="withdraw-content">
                  <input
                    type="number"
                    placeholder="Amount to withdraw"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="game-input"
                  />
                  
                  {/* Error Message */}
                  {errorMessage && (
                    <div className="error-message">
                      ⚠️ {errorMessage}
                    </div>
                  )}
                  
                  <button
                    onClick={handleWithdraw}
                    disabled={!withdrawAmount || isWithdrawing}
                    className="game-button danger full-width"
                  >
                    {isWithdrawing ? (
                      <div className="button-loading">
                        <div className="loading-spinner"></div>
                        Processing withdrawal...
                      </div>
                    ) : (
                      '💸 WITHDRAW 💸'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bridge Section */}
        {isConnected && (
          <div className="bridge-section">
            <div className="bridge-card">
              <h3 className="card-title text-glow">Cross-Chain Bridge</h3>
              <p className="bridge-description">
                Bridge tokens and place cross-chain bets between Base and Polygon using LayerZero
              </p>
              <div className="bridge-buttons">
                <button
                  onClick={() => setShowCrossChainModal(true)}
                  className="game-button primary"
                >
                  <ArrowUpDown className="button-icon" />
                  LayerZero Bridge
                </button>
                <button
                  onClick={() => setShowCrossChainModal(true)}
                  className="game-button secondary"
                >
                  🌉 Cross-Chain Betting
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bet Results with Enhanced Animations */}
        {betResults.length > 0 && (
          <div className="bet-history">
            <h2 className="history-title text-glow">
              🏆 Bet History 🏆
            </h2>
            <div className="history-list">
              {betResults.map((result, index) => (
                <div
                  key={index}
                  className={`bet-result ${
                    result.won 
                      ? 'bet-result-win sound-win' 
                      : 'bet-result-lose sound-lose'
                  }`}
                >
                  <div className="bet-result-content">
                    <div className="bet-result-left">
                      {result.won ? (
                        <TrendingUp className="result-icon win-icon" size={24} />
                      ) : (
                        <TrendingDown className="result-icon lose-icon" size={24} />
                      )}
                      <div className="bet-result-info">
                        <div className="bet-result-status">
                          {result.won ? '🎉 WIN!' : '💔 LOSS'}
                        </div>
                        <div className="bet-result-leverage">
                          Leverage: {result.leveragePercent}%
                        </div>
                      </div>
                    </div>
                    <div className="bet-result-right">
                      <div className="bet-result-amount">
                        {result.amount} USDC
                      </div>
                      <div className="bet-result-payout">
                        {result.won ? '+' : '-'}{(parseFloat(result.amount) * result.leveragePercent / 100).toFixed(2)} USDC
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Chain Bridge Modal */}
        {showCrossChainModal && (
          <CrossChainBridge
            onClose={() => setShowCrossChainModal(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
