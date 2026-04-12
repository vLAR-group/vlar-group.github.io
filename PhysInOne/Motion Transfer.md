\subsection{Motion Transfer}
Motion transfer seeks to propagate motion dynamics from a source video to a target image, synthesizing a new video that retains the target's visual attributes while adopting the source's motion patterns. Current approaches leverage optical flow to encode motion, achieving compelling results on datasets like DAVIS \cite{Pont-Tuset2017}. However, DAVIS primarily features simple motion patterns, such as a solitary swan gliding across water, with limited physical complexity. This raises a significant question about whether these methods can accurately transfer multiphysics interactions involving multiple objects from one video to another. This capability is essential for advanced applications like film and animation production, and virtual prototyping. 

This section evaluates recent methods \textbf{MotionPro} \cite{Zhang2025} and \textbf{GoWithTheFlow} \cite{Burgert2025} using a subset of 273 dynamic 3D scenes (source) from the \nickname{} val set. For quantitative assessment, we generate paired target scenes by replacing source objects with alternative shapes and materials while preserving identical physics activities. New videos rendered from these target scenes enable motion transfer performance evaluation. In Table \ref{tab:motion_transfer} and Figure \ref{fig:motion_transfer_res}, both methods maintain high visual fidelity overall, but fail to transfer intricate physical motions accurately, underscoring fundamental challenges in modeling complex physical dynamics, a gap we expect our dataset will motivate future methods to fill. More details of experiment settings are in Appendix \ref{app:motion_transfer_exp}.
\begin{table}[htb] \tabcolsep=0.3cm  \vspace{-0.3cm}
\centering
\caption{Quantitative results of transferring physical motions.}\vspace{-0.25cm}
\label{tab:motion_transfer}
\resizebox{0.48\textwidth}{!}{
\begin{tabular}{lccccc}
\toprule[1.0pt]
\rowcolor{headergray}  & PMF $\uparrow$   & PSNR $\uparrow$ & SSIM $\uparrow$ & LPIPS$\downarrow$   \\ \toprule[1.0pt]
GoWithTheFlow \cite{Burgert2025}  & 3.309 & 18.98  & 0.691 & \textbf{0.410}    \\
MotionPro \cite{Zhang2025} & \textbf{3.484} & \textbf{20.28}  & \textbf{0.775} & 0.467   \\ \hline
\toprule[1.0pt]
\end{tabular}
}\vspace{-0.4cm}
\end{table}



