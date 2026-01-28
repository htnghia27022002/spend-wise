import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

type EncodingType = 'base64' | 'hex' | 'url' | 'json';

interface EncoderDecoderFormProps {
    onEncode: (input: string, type: EncodingType) => Promise<string>;
    onDecode: (input: string, type: EncodingType) => Promise<string>;
}

export function EncoderDecoderForm({ onEncode, onDecode }: EncoderDecoderFormProps) {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [type, setType] = useState<EncodingType>('base64');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const encodingTypes: { value: EncodingType; label: string }[] = [
        { value: 'base64', label: 'Base64' },
        { value: 'hex', label: 'Hexadecimal' },
        { value: 'url', label: 'URL Encode' },
        { value: 'json', label: 'JSON' },
    ];

    const handleEncode = async () => {
        setError('');
        if (!input.trim()) {
            setError('Please enter some text');
            return;
        }

        setLoading(true);
        try {
            const result = await onEncode(input, type);
            setOutput(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Encoding failed');
        } finally {
            setLoading(false);
        }
    };

    const handleDecode = async () => {
        setError('');
        if (!input.trim()) {
            setError('Please enter some text');
            return;
        }

        setLoading(true);
        try {
            const result = await onDecode(input, type);
            setOutput(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Decoding failed');
        } finally {
            setLoading(false);
        }
    };

    const swapInputOutput = () => {
        setInput(output);
        setOutput(input);
        setError('');
    };

    return (
        <div className="w-full space-y-6">
            {/* Type Selector */}
            <div className="space-y-2">
                <Label htmlFor="encoding-type">Encoding Type</Label>
                <Select value={type} onValueChange={(value) => setType(value as EncodingType)}>
                    {encodingTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                            {t.label}
                        </option>
                    ))}
                </Select>
            </div>

            {/* Input Section */}
            <div className="space-y-2">
                <Label htmlFor="input">Input</Label>
                <Textarea
                    id="input"
                    placeholder="Enter text to encode/decode"
                    value={input}
                    onChange={(e) => {
                        setInput(e.target.value);
                        setError('');
                    }}
                    className="min-h-40"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 sm:flex-row">
                <Button 
                    onClick={handleEncode} 
                    disabled={loading || !input.trim()}
                    className="flex-1"
                >
                    {loading ? 'Processing...' : 'Encode'}
                </Button>
                <Button 
                    onClick={handleDecode} 
                    disabled={loading || !input.trim()}
                    variant="outline"
                    className="flex-1"
                >
                    {loading ? 'Processing...' : 'Decode'}
                </Button>
                <Button 
                    onClick={swapInputOutput} 
                    disabled={!output}
                    variant="ghost"
                    className="flex-1"
                >
                    ⇅ Swap
                </Button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Separator */}
            <Separator />

            {/* Output Section */}
            <div className="space-y-2">
                <Label htmlFor="output">Output</Label>
                <Textarea
                    id="output"
                    placeholder="Result will appear here"
                    value={output}
                    readOnly
                    className="min-h-40 bg-muted"
                />
            </div>

            {/* Copy Button */}
            {output && (
                <Button 
                    onClick={() => {
                        navigator.clipboard.writeText(output);
                    }}
                    variant="outline"
                    className="w-full"
                >
                    📋 Copy Output
                </Button>
            )}
        </div>
    );
}
