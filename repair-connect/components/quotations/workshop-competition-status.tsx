'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Clock,
  Trophy,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
  TrendingUp
} from 'lucide-react'

interface CompetitionSummary {
  totalCompetitors: number
  competitorsSubmitted: number
  competitionStatus: 'active' | 'closed'
  winnerInfo?: {
    isWinner: boolean
    winnerWorkshop?: string
    winningAmount?: number
  }
  statusMessage: string
}

interface WorkshopCompetitionStatusProps {
  competitionSummary: CompetitionSummary
  hasSubmittedQuote: boolean
  quoteAmount?: number
  onSubmitQuote?: () => void
  onUpdateQuote?: () => void
  isLoading?: boolean
}

export default function WorkshopCompetitionStatus({
  competitionSummary,
  hasSubmittedQuote,
  quoteAmount,
  onSubmitQuote,
  onUpdateQuote,
  isLoading
}: WorkshopCompetitionStatusProps) {
  const {
    totalCompetitors,
    competitorsSubmitted,
    competitionStatus,
    winnerInfo,
    statusMessage
  } = competitionSummary

  const getStatusIcon = () => {
    if (competitionStatus === 'closed') {
      return winnerInfo?.isWinner ?
        <CheckCircle className="h-5 w-5 text-green-600" /> :
        <XCircle className="h-5 w-5 text-red-600" />
    }

    if (hasSubmittedQuote) {
      return <Clock className="h-5 w-5 text-blue-600" />
    }

    return <AlertCircle className="h-5 w-5 text-orange-600" />
  }

  const getStatusColor = () => {
    if (competitionStatus === 'closed') {
      return winnerInfo?.isWinner ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
    }

    if (hasSubmittedQuote) {
      return 'bg-blue-50 border-blue-200'
    }

    return 'bg-orange-50 border-orange-200'
  }

  const canSubmitOrUpdate = competitionStatus === 'active'

  return (
    <Card className={`${getStatusColor()}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Competition Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Message */}
        <div className="text-center p-4 bg-white/50 rounded-lg">
          <p className="font-medium text-gray-900">{statusMessage}</p>
        </div>

        {/* Competition Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
              <Users className="h-6 w-6" />
              {totalCompetitors + 1}
            </div>
            <div className="text-sm text-gray-600">Total Participants</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-blue-600">
              <TrendingUp className="h-6 w-6" />
              {competitorsSubmitted + (hasSubmittedQuote ? 1 : 0)}
            </div>
            <div className="text-sm text-gray-600">Quotes Submitted</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-bold">
              <Clock className="h-6 w-6" />
              <Badge variant={competitionStatus === 'active' ? 'default' : 'secondary'}>
                {competitionStatus}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">Competition</div>
          </div>
        </div>

        {/* Your Quote Status */}
        {hasSubmittedQuote && (
          <div className="bg-white/70 rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Your Quote</div>
                <div className="text-sm text-gray-600">
                  Status: <Badge variant="secondary">Submitted</Badge>
                </div>
              </div>
              {quoteAmount && (
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900 flex items-center gap-1">
                    <DollarSign className="h-5 w-5" />
                    {quoteAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">AED</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Winner Information (if competition closed) */}
        {competitionStatus === 'closed' && winnerInfo && (
          <div className={`rounded-lg p-4 border ${
            winnerInfo.isWinner ? 'bg-green-100 border-green-200' : 'bg-gray-100 border-gray-200'
          }`}>
            {winnerInfo.isWinner ? (
              <div className="text-center">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="font-bold text-green-800 text-lg">Congratulations!</div>
                <div className="text-green-700">Your quote was selected by the customer</div>
                {winnerInfo.winningAmount && (
                  <div className="text-2xl font-bold text-green-800 mt-2">
                    AED {winnerInfo.winningAmount.toLocaleString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="font-medium text-gray-800">Competition Results</div>
                <div className="text-gray-600">
                  Winner: <span className="font-medium">{winnerInfo.winnerWorkshop}</span>
                </div>
                {winnerInfo.winningAmount && (
                  <div className="text-xl font-bold text-gray-800 mt-1">
                    Winning Amount: AED {winnerInfo.winningAmount.toLocaleString()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {canSubmitOrUpdate && (
          <div className="flex gap-2 justify-center">
            {!hasSubmittedQuote ? (
              <Button
                onClick={onSubmitQuote}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <DollarSign className="h-4 w-4" />
                Submit Your Quote
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={onUpdateQuote}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                Update Your Quote
              </Button>
            )}
          </div>
        )}

        {/* Competition Insights */}
        {competitionStatus === 'active' && (
          <div className="text-xs text-gray-500 text-center space-y-1">
            <p>💡 <strong>Tips:</strong> You can submit or update your quote until the customer makes a decision</p>
            <p>🔒 Competitor quotes and pricing are hidden during the competition</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}