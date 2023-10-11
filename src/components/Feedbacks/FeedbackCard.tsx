import React, { ChangeEvent, FormEvent, useContext, useState } from "react";
import { FeedbackStructure } from "../../types";
import { ThemeContext } from "../../contexts/ThemeContext";
import { borderColor } from "../../utils/theme/border";
import * as icon from "react-icons/bs";
import * as iconAI from "react-icons/ai";
import { UserContext } from "../../contexts/UserContext";
import api from "../../utils/api";
import { buttonColor } from "../../utils/theme/button";

export const FeedbackCard: React.FC<{ feedback: FeedbackStructure, botid: string, updateFeedbacks: () => Promise<void> }> = ({ feedback, botid, updateFeedbacks }) => {
    const { color } = useContext(ThemeContext);
    const { user } = useContext(UserContext);

    const [isDeleted, setisDeleted] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [editedContent, setEditedContent] = useState<string>("");
    const [submited, setSubmited] = useState<boolean>(false);

    const handleChangeEdit = (event: ChangeEvent<HTMLTextAreaElement>): void => {
        setEditedContent(event.target.value);
    };

    const handleSubmitEdit  = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        setSubmited(true);
        event.preventDefault();

        await api.deleteFeedback(botid, user?.id as string);
        await api.postFeedback(feedback?.stars, feedback.posted_at, editedContent, botid, user?.id as string);
        await updateFeedbacks();

        setSubmited(false);
        setIsEdit(false);
    };

    return (
        <div className={`bg-neutral-900 rounded-lg p-1 text-white break-words border-2 ${borderColor[color]}`}>
            <div className="flex flex-col p-3 gap-2">
                <div className="flex flex-row items-center justify w-[100%]">
                    <img
                        src={`https://cdn.discordapp.com/avatars/${feedback?.author.id}/${feedback?.author.avatar}.png?size=2048`}
                        alt={`${feedback?.author.username}'s avatar`}
                        className="w-[30px] h-[30px] rounded-full"
                    />
                    <div className="flex gap-2 items-center justify-center">
                        <span className="p-1 ml-1">{feedback?.author.username}</span>
                        <span className="text-neutral-500">{new Date(feedback.posted_at).toLocaleString().split(", ")[0]}</span>
                    </div>
                    {user?.id === feedback?.author.id && (
                        <div className="flex gap-3 justify-end w-[100%]">
                            <button onClick={async () => {
                                setisDeleted(true);
                                await api.deleteFeedback(botid, user?.id);
                                await updateFeedbacks();
                                setisDeleted(false);
                            }} className="flex flex-grow justify-end">
                                {!isDeleted ? <icon.BsTrash size={20} className="hover:fill-red-500 transition-colors duration-300" /> : <iconAI.AiOutlineLoading3Quarters fill="#fff" size={20} className="animate-spin" />}
                            </button>
                            <button onClick={() => {
                                setIsEdit(true);
                            }} className="flex justify-end">
                                <icon.BsPencilSquare size={20} className="hover:fill-amber-500 transition-colors duration-300" />
                            </button>
                        </div>
                    )}
                </div>
                {isEdit ? (
                    <form onSubmit={handleSubmitEdit} className="flex flex-col gap-3">
                        <div className={`bg-neutral-800 rounded-lg ${borderColor[color]} border-2 text-white w-[100%]`}>
                            <textarea defaultValue={feedback.content} rows={4} onChange={handleChangeEdit} className="bg-transparent w-[100%] focus:outline-none p-2" cols={22} required placeholder="Digite aqui" maxLength={500} />
                        </div>
                        <div className="flex gap-3 items-center justify-center">
                            <input disabled={submited} className={`disabled:cursor-default disabled:opacity-70 border-2 duration-300 transition-all cursor-pointer ${buttonColor[color]} p-3 rounded-lg w-[100%] text-white`} type="submit" value="Enviar" />
                            {submited && <iconAI.AiOutlineLoading3Quarters fill="#fff" size={30} className="animate-spin" />}
                        </div>
                    </form>
                ) : <div className="py-2">{feedback.content}</div>}
                <div className="flex flex-row gap-1">
                    {Array(feedback.stars).fill(0).map(() => (
                        <icon.BsStarFill />
                    ))}
                    {Array(5 - feedback.stars).fill(0).map(() => (
                        <icon.BsStar />
                    ))}
                </div>
            </div>
        </div>
    )
}