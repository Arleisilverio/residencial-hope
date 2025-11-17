import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import SimpleDatePicker from '../ui/SimpleDatePicker';
import { Save } from 'lucide-react';

interface TransactionFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  transactionToEdit?: Transaction | null;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'created_at'>) => Promise<any>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<any>;
}

const expenseCategories = [
  'Aluguel', 'Manutenção', 'Limpeza', 'Materiais', 'Mão de Obra', 'Internet', 
  'Energia', 'Água', 'Comissão', 'Outras Despesas'
];

const TransactionFormDialog: React.FC<TransactionFormDialogProps> = ({
  isOpen, onClose, onSuccess, transactionToEdit, addTransaction, updateTransaction
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [transactionDate, setTransactionDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (transactionToEdit) {
        setAmount(String(transactionToEdit.amount));
        setDescription(transactionToEdit.description);
        setCategory(transactionToEdit.category || '');
        setTransactionDate(new Date(transactionToEdit.transaction_date));
      } else {
        // Reset form for new transaction
        setAmount('');
        setDescription('');
        setCategory('');
        setTransactionDate(new Date());
      }
    }
  }, [transactionToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const transactionData = {
      type: 'expense' as const, // O tipo é sempre 'expense'
      amount: parseFloat(amount),
      description,
      category,
      transaction_date: transactionDate.toISOString(),
    };

    try {
      if (transactionToEdit) {
        await updateTransaction(transactionToEdit.id, transactionData);
      } else {
        await addTransaction(transactionData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save transaction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={transactionToEdit ? 'Editar Despesa' : 'Adicionar Despesa'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Valor (R$)</label>
            <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0,00" required />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Data da Transação</label>
            <SimpleDatePicker value={transactionDate} onSelect={setTransactionDate} />
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">Categoria</label>
          <Select value={category} onValueChange={setCategory} required>
            <SelectTrigger><SelectValue placeholder="Selecione uma categoria..." /></SelectTrigger>
            <SelectContent>
              {expenseCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium">Descrição</label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Compra de material de limpeza" required />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Despesa'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};

export default TransactionFormDialog;