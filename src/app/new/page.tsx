import Link from 'next/link'
import { faArrowAltCircleLeft } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { prisma } from '@/db'
import { redirect } from 'next/navigation'
import RepeatPattern from './RepeatPattern'
import { sanitizeString } from '@/utils/sanitize'
import { patternFormatChecker, getRepeatPatternObject, getStartEndDate } from '@/utils/dates'
import Header from '@/components/templates/Header'


async function createHabit (data: FormData) {
	'use server'

	// Get posted data
	let habitName = data.get('habitName')?.valueOf().toString() || ''
	let repeatPattern = data.get('repeatPattern')?.valueOf().toString() || '1d'

	// Sanitize posted data
	habitName = sanitizeString( habitName )
	repeatPattern = sanitizeString( repeatPattern )

	// Validate posted data
	if ( typeof habitName !== 'string' || habitName.length === 0 )
		throw new Error('Habit name Error');
	if ( typeof repeatPattern !== 'string' || repeatPattern.length === 0 || !patternFormatChecker(repeatPattern) )
		throw new Error('Habit repeat type Error');

	// Get pattern object
	let patternObj = getRepeatPatternObject(repeatPattern)

	// calculate first checkin start/end dates
	const {startDate, endDate} = getStartEndDate (patternObj, 0)
	
	await prisma.habits.create({
		data: {
			name: habitName,
			repeatPattern,
			readablePattern: patternObj.readablePattern,
			levels: patternObj.levels,
			startDate,
			endDate,
			// TODO: Get userId from session
			userId: '34e3569f-2090-40ea-a519-28d28bc803e0'
		}
	})

	redirect('/')
}


export default function Home() {

	return (
		<>
			<Header>
				<Link
					className="border border-slate-300 text-slate-300 rounded px-2 py-1 hover:bg-slate-700 focus-within:bg-slate-700 outline-none flex gap-2"
					href="..">
						<FontAwesomeIcon icon={faArrowAltCircleLeft} className='w-4' /> Back</Link>
			</Header>
			<h2 className="text-xl text-orange-500 border-b border-orange-500 pb-2 my-4">New Habit:</h2>
			<form action={createHabit} className="flex flex-col gap-4">
				<label htmlFor="name" className="text-slate-400 text-xs">
					What habit do you want to streak up?
				</label>
				<input id="name" name="habitName" type="text" minLength={3} maxLength={50} required
					placeholder='Example: Read books for 30 min'
					className="border border-slate-300 rounded px-2 py-1 outline-none text-slate-800" />
				<label htmlFor="habitType" className="text-slate-400 text-xs">
					How often do you want to do it?
				</label>
				<RepeatPattern />
				<div className='flex justify-end gap-2'>
					<button type="submit" className="border border-slate-300 text-slate-300 rounded px-2 py-1 hover:bg-slate-700 focus-within:bg-slate-700 outline-none">Create</button>
					<Link href=".." className='border border-slate-300 text-slate-300 rounded px-2 py-1 hover:bg-slate-700 focus-within:bg-slate-700 outline-none'>Cancel</Link>
				</div>
			</form>
		</>
	)
}